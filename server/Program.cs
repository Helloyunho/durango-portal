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

            // Build the full file path
            string filePath = Path.Combine(baseDir, urlPath);

            if (File.Exists(filePath))
            {
                // Serve the file
                byte[] buffer = File.ReadAllBytes(filePath);
                response.ContentType = GetContentType(filePath);
                response.ContentLength64 = buffer.Length;
                response.OutputStream.Write(buffer, 0, buffer.Length);
                response.OutputStream.Close();
            }
            else
            {
                // File not found, send 404
                response.StatusCode = 404;
                byte[] buffer = Encoding.UTF8.GetBytes("404 - File Not Found");
                response.ContentLength64 = buffer.Length;
                response.OutputStream.Write(buffer, 0, buffer.Length);
                response.OutputStream.Close();
            }
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
            _ => "application/octet-stream",
        };
    }
}