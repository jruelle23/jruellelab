<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\GuzzleException;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

// Add a global error handler so unhandled exceptions return a response
// instead of crashing the process
$app->addErrorMiddleware(false, false, false);

$app->any('[{routes:.*}]', function (Request $request, Response $response) {
    $backendUrl = 'http://localhost:8080';

    $client = new Client([
        'timeout'         => 3.0,
        'connect_timeout' => 2.0,
    ]);

    $method = $request->getMethod();
    $uri    = $request->getUri();
    $path   = $uri->getPath();
    $query  = $uri->getQuery();

    $targetUrl = $backendUrl . $path . ($query ? '?' . $query : '');

    $headers = $request->getHeaders();
    $body    = (string) $request->getBody();

    unset($headers['Host']);

    try {

        $backendResponse = $client->request($method, $targetUrl, [
            'headers'     => $headers,
            'body'        => $body,
            'http_errors' => false,
        ]);

        $response = $response->withStatus($backendResponse->getStatusCode());

        foreach ($backendResponse->getHeaders() as $name => $values) {
            // Skip hop-by-hop headers that must not be forwarded
            if (in_array(strtolower($name), ['transfer-encoding', 'connection', 'keep-alive'], true)) {
                continue;
            }
            $response = $response->withHeader($name, $values);
        }

        $response->getBody()->write((string) $backendResponse->getBody());

    } catch (ConnectException $e) {
        // Backend is down / unreachable / timed out connecting
        $response = $response
            ->withStatus(502)
            ->withHeader('Content-Type', 'application/json');
        $response->getBody()->write(json_encode([
            'error'   => 'Backend unreachable.',
            'details' => $e->getMessage(),
        ]));

    } catch (GuzzleException $e) {
        // Any other Guzzle-level failure (read timeout, SSL, etc.)
        $response = $response
            ->withStatus(504)
            ->withHeader('Content-Type', 'application/json');
        $response->getBody()->write(json_encode([
            'error'   => 'Gateway error.',
            'details' => $e->getMessage(),
        ]));

    } catch (\Throwable $e) {
        // Catch-all safety net — process keeps running
        $response = $response
            ->withStatus(500)
            ->withHeader('Content-Type', 'application/json');
        $response->getBody()->write(json_encode([
            'error'   => 'Internal gateway error.',
            'details' => $e->getMessage(),
        ]));
    }

    return $response;
});

$app->run();