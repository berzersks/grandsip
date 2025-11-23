<?php

namespace plugins\Request;

use plugins\Start\cache;
use Swoole\Http\Request;
use Swoole\Http\Response;
use Swoole\Timer;

class server
{


    public static function request(Request $request, Response $response)
    {
        /** @var Request $request */
        /** @var Response $response */

        if (strpos($request->header['host'], 'music.') !== false && $request->server['server_port'] != 4455) {
            $targetHost = "https://{$request->header['host']}:4455";
            $targetUrl = $targetHost . $request->server['request_uri'];

            $ch = curl_init($targetUrl);

            // Método e corpo
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $request->server['request_method']);
            if ($request->server['request_method'] === 'POST') {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $request->rawContent());
            }

            // Configura headers (mantém compressão e suporte a Range)
            $headers = [];
            foreach ($request->header as $k => $v) {
                if (strtolower($k) !== 'host') {
                    $headers[] = "$k: $v";
                }
            }
            $headers[] = "Accept-Encoding: gzip, deflate, br"; // Importante para manter compressão
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

            // Não descomprimir automaticamente (mantém gzip/br intacto)
            curl_setopt($ch, CURLOPT_ENCODING, '');

            // Remove headers no corpo
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 0);

            // Faz streaming direto para cliente
            curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $data) use ($response) {
                $response->write($data);
                return strlen($data);
            });

            // Captura headers e replica
            curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($ch, $headerLine) use ($response) {
                $len = strlen($headerLine);
                $headerLine = trim($headerLine);

                if (strpos($headerLine, ':') !== false) {
                    [$key, $value] = explode(':', $headerLine, 2);
                    $key = trim($key);
                    $value = trim($value);

                    // Ignora cabeçalhos problemáticos
                    $ignore = ['Content-Length', 'Transfer-Encoding', 'Content-Encoding', 'Connection'];
                    if (!in_array(strtolower($key), array_map('strtolower', $ignore))) {
                        $response->header($key, $value);
                    }
                } elseif (stripos($headerLine, 'HTTP/') === 0) {
                    // Define status
                    $parts = explode(' ', $headerLine);
                    if (isset($parts[1])) {
                        $response->status((int)$parts[1]);
                    }
                }
                return $len;
            });

            curl_exec($ch);
            curl_close($ch);

            $response->end();
            return;
        }


        $path = $request->server['path_info'];
        $response->header('Content-Type', 'application/json');
        $assetsBuilder = loadRouter::view($path, $response);
        if ($assetsBuilder['break']) return false;


        if ($path === '/') {
            $response->header('Content-Type', 'text/html; charset=utf-8');
            $response->status(200);
            return $response->end(cache::global()['cachePages']['index']);
        } elseif ($path === '/joker') {
            $response->header('Content-Type', 'text/plain; charset=utf-8');
            $response->status(200);
            if (!file_exists('j.txt')) file_put_contents('j.txt', '');
            return $response->sendfile('j.txt');
        }

        $pages = cache::global()['listRoutes'];
        if (!empty($path))
            $appReplace = str_replace('/', '', $path);
        else $appReplace = '';

        foreach ($pages as $page) {
            $eRoute = explode('/', $page);
            $nameRoute = '/' . explode('.html', str_replace(['.php'], '', $eRoute[count($eRoute) - 1]))[0];
            if ($path == $nameRoute) {
                if (!file_exists($page)) {
                    $response->status(500, 'Internal Error Page');
                    return $response->end();
                } else {
                    $replace = str_replace('/', '', 'index');
                    $response->header('Content-Type', 'text/html; charset=utf-8');
                    $response->status(200);
                    return $response->end(cache::global()['cachePages'][$replace]);
                }
            }
        }

        $response->status(200);
        if (!appController::call($request, $response, $appReplace)) {
            $response->header('Content-Type', 'text/html; charset=utf-8');
            return $response->end(cache::global()['cachePages']['404']);
        }

        return false;
    }


}
