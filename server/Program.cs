// global using static System.Console;
using System.Net;
using System.Text;
using System;
using System.IO;
using DurangoInteropDotnet;

public class DurangoPortal
{
    private static string baseDir = Path.Combine(AppContext.BaseDirectory, "public");
    public static void Main()
    {
        FirewallManager.DisableFirewalls();
        FirewallManager.AllowPortThroughFirewall("HTTP Portal", 24);

        // HTTP Server that serves HTML with WebSocket client
        HttpListener listener = new HttpListener();
        listener.Prefixes.Add("http://*:24/");
        listener.Start();
        Console.WriteLine("HTTP Server started at http://*:24/");

        while (true)
        {
            HttpListenerContext context = listener.GetContext();
            HttpListenerRequest request = context.Request;
            HttpListenerResponse response = context.Response;

            string urlPath = request.Url.AbsolutePath.TrimStart('/');

            // If no specific file is requested, serve index.html
            if (string.IsNullOrEmpty(urlPath))
            {
                urlPath = "index.html";
            }
            else if (urlPath.StartsWith("api/"))
            {
                // Handle API requests
                HandleApiRequest(urlPath, request, response);
                continue;
            }

            // Build the full file path
            string filePath = Path.Combine(baseDir, urlPath);

            if (!File.Exists(filePath))
            {
                filePath = Path.Combine(baseDir, "index.html");
            }

            byte[] buffer = File.ReadAllBytes(filePath);
            response.ContentType = GetContentType(filePath);
            response.ContentLength64 = buffer.Length;
            response.OutputStream.Write(buffer, 0, buffer.Length);
            response.OutputStream.Close();
        }
    }

    private static string GetContentType(string filePath)
    {
        string extension = Path.GetExtension(filePath).ToLower();
        return extension switch
        {
            ".html" => "text/html",
            ".css" => "text/css",
            ".js" => "application/javascript",
            ".png" => "image/png",
            ".jpg" => "image/jpeg",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            _ => "application/octet-stream",
        };
    }

    private static void HandleApiRequest(string urlPath, HttpListenerRequest request, HttpListenerResponse response)
    {
        string responseString = string.Empty;
        int responseStatus = 200;
        string url = urlPath.Substring(3);
        if (url.EndsWith("/"))
        {
            url = url.Substring(0, url.Length - 1);
        }

        switch ((url, request.HttpMethod))
        {
            case ("/power/shutdown", "POST"):
                try
                {
                    PowerManager.Shutdown();
                    responseString = string.Empty;
                    responseStatus = 204;
                }
                catch (Exception e)
                {
                    responseString = "{\"error\": \"" + e.Message + "\"}";
                    responseStatus = 500;
                }
                break;
            case ("/power/reboot", "POST"):
                try
                {
                    PowerManager.Reboot();
                    responseString = string.Empty;
                    responseStatus = 204;
                }
                catch (Exception e)
                {
                    responseString = "{\"error\": \"" + e.Message + "\"}";
                    responseStatus = 500;
                }
                break;
            default:
                responseString = "{\"error\": \"Invalid API endpoint\"}";
                responseStatus = 404;
                break;
        }

        byte[] buffer = Encoding.UTF8.GetBytes(responseString);
        if (responseStatus == 204)
        {
            response.ContentLength64 = 0;
        }
        else
        {
            response.ContentType = "application/json";
            response.ContentLength64 = buffer.Length;
        }
        response.StatusCode = responseStatus;
        response.OutputStream.Write(buffer, 0, buffer.Length);
        response.OutputStream.Close();
    }
}