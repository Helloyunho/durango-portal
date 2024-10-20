using System.Net;
using System.Text.Json;
using DurangoInteropDotnet;
using System.Text;
using System.Web;

public class DurangoPortal
{
    private static string baseDir = Path.Combine(AppContext.BaseDirectory, "public");
    public static async Task Main()
    {
        FirewallManager.DisableFirewalls();
        FirewallManager.AllowPortThroughFirewall("HTTP Portal", 24);
        AppManager.EnableSideloadedApps();

        // HTTP Server that serves HTML with WebSocket client
        HttpListener listener = new HttpListener();
        listener.Prefixes.Add("http://*:24/");
        listener.Start();
        Console.WriteLine("HTTP Server started at http://*:24/");

        while (true)
        {
            HttpListenerContext context = await listener.GetContextAsync();
            _ = HandleRequest(context);
        }
    }

    private static async Task HandleRequest(HttpListenerContext context)
    {
        HttpListenerRequest request = context.Request;
        HttpListenerResponse response = context.Response;

        string? urlPath = request.Url?.AbsolutePath.TrimStart('/');

        // If no specific file is requested, serve index.html
        if (string.IsNullOrEmpty(urlPath))
        {
            urlPath = "index.html";
        }
        else if (urlPath.StartsWith("api/"))
        {
            // Handle API requests
            await HandleApiRequest(urlPath, request, response);
            return;
        }

        // Build the full file path
        string filePath = Path.Combine(baseDir, urlPath);

        if (!File.Exists(filePath))
        {
            filePath = Path.Combine(baseDir, "index.html");
        }

        byte[] buffer = await File.ReadAllBytesAsync(filePath);
        response.ContentType = GetContentType(filePath);
        response.ContentLength64 = buffer.Length;
        await response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
        response.OutputStream.Close();
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

    private static async Task<string> ReadTextAsync(HttpListenerRequest request)
    {
        using StreamReader reader = new StreamReader(request.InputStream, request.ContentEncoding);
        string text = await reader.ReadToEndAsync();
        return text;
    }

    private static async Task<byte[]> ReadBytesAsync(HttpListenerRequest request)
    {
        using MemoryStream ms = new MemoryStream();
        await request.InputStream.CopyToAsync(ms);
        return ms.ToArray();
    }

    private static async Task<T?> ReadJsonAsync<T>(HttpListenerRequest request)
    {
        return await JsonSerializer.DeserializeAsync<T>(request.InputStream, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    }

    private static string SerializeToJson<T>(T obj)
    {
        return JsonSerializer.Serialize<T>(obj, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    }

    private static async Task HandleApiRequest(string urlPath, HttpListenerRequest request, HttpListenerResponse response)
    {
        int responseStatus = 200;
        string url = urlPath[3..];
        if (url.EndsWith('/'))
        {
            url = url[..^1];
        }

        string responseString;
        try
        {
            switch ((url, request.HttpMethod))
            {
                case ("/power/shutdown", "POST"):
                    {
                        PowerManager.Shutdown();
                        responseString = string.Empty;
                        responseStatus = 204;
                        break;
                    }
                case ("/power/reboot", "POST"):
                    {
                        PowerManager.Reboot();
                        responseString = string.Empty;
                        responseStatus = 204;
                        break;
                    }
                case ("/bluescreen", "POST"):
                    BluescreenManager.ShowBluescreen();
                    responseString = string.Empty;
                    responseStatus = 204;
                    break;
                case ("/process", "GET"):
                    {
                        var processes = ProcessManager.GetProcesses();
                        responseString = SerializeToJson(processes);
                        break;
                    }
                case ("/process", "DELETE"):
                    {
                        string? id = request.QueryString["id"];
                        if (int.TryParse(id, out int processId))
                        {
                            ProcessManager.KillProcess(processId);
                            responseString = string.Empty;
                            responseStatus = 204;
                        }
                        else
                        {
                            string? name = request.QueryString["name"];
                            if (!string.IsNullOrEmpty(name))
                            {
                                ProcessManager.KillProcess(name);
                                responseString = string.Empty;
                                responseStatus = 204;
                            }
                            else
                            {
                                ErrorContainer error = new ErrorContainer("Invalid request");
                                responseString = SerializeToJson(error);
                                responseStatus = 400;
                            }
                        }
                        break;
                    }
                case ("/app", "GET"):
                    {
                        var apps = AppManager.ListInstalledApps().ToArray();
                        responseString = SerializeToJson(apps);
                        break;
                    }
                case ("/license", "GET"):
                    {
                        var licenses = LicenseManager.ListLicenses().ToArray();
                        responseString = SerializeToJson(licenses);
                        break;
                    }
                case ("/app", "DELETE"):
                    {
                        string? id = request.QueryString["id"];
                        if (!string.IsNullOrEmpty(id))
                        {
                            // await AppManager.RemoveApp(id);
                            AppManager.RemoveApp(id);
                            responseString = string.Empty;
                            responseStatus = 204;
                        }
                        else
                        {
                            ErrorContainer error = new ErrorContainer("Invalid request");
                            responseString = SerializeToJson(error);
                            responseStatus = 400;
                        }
                        break;
                    }
                case ("/app", "POST"):
                    {
                        using (TempManager temp = new TempManager())
                        {
                            string filePath = temp.GetTempFilePath(".appx");
                            using (FileStream? fs = new FileStream(filePath, FileMode.Create, FileAccess.Write))
                            {
                                await request.InputStream.CopyToAsync(fs);
                            }
                            // await AppManager.InstallApp(filePath);
                            AppManager.InstallApp(filePath);
                            responseString = string.Empty;
                            responseStatus = 204;
                        }
                        break;
                    }
                case ("/app/cert", "POST"):
                    {
                        using (TempManager temp = new TempManager())
                        {
                            string certPath = temp.GetTempFilePath(".p7x");
                            using (FileStream? fs = new FileStream(certPath, FileMode.Create, FileAccess.Write))
                            {
                                await request.InputStream.CopyToAsync(fs);
                            }
                            AppManager.InstallCert(certPath);
                            responseString = string.Empty;
                            responseStatus = 204;
                        }
                        break;
                    }
                case ("/registry/key", "GET"):
                    {
                        string? keyRaw = request.QueryString["key"];
                        string? key = HttpUtility.UrlDecode(keyRaw);
                        if (!string.IsNullOrEmpty(key))
                        {
                            var subkeys = RegistryManager.GetSubKeys(key);
                            responseString = SerializeToJson(subkeys);
                        }
                        else
                        {
                            ErrorContainer error = new ErrorContainer("Invalid request");
                            responseString = SerializeToJson(error);
                            responseStatus = 400;
                        }
                        break;
                    }
                case ("/registry/key", "POST"):
                    {
                        string? keyRaw = request.QueryString["key"];
                        string? key = HttpUtility.UrlDecode(keyRaw);
                        if (!string.IsNullOrEmpty(key))
                        {
                            RegistryManager.CreateKey(key);
                            responseString = string.Empty;
                            responseStatus = 204;
                        }
                        else
                        {
                            ErrorContainer error = new ErrorContainer("Invalid request");
                            responseString = SerializeToJson(error);
                            responseStatus = 400;
                        }
                        break;
                    }
                case ("/registry/key", "DELETE"):
                    {
                        string? keyRaw = request.QueryString["key"];
                        string? key = HttpUtility.UrlDecode(keyRaw);
                        if (!string.IsNullOrEmpty(key))
                        {
                            RegistryManager.DeleteKey(key);
                            responseString = string.Empty;
                            responseStatus = 204;
                        }
                        else
                        {
                            ErrorContainer error = new ErrorContainer("Invalid request");
                            responseString = SerializeToJson(error);
                            responseStatus = 400;
                        }
                        break;
                    }
                case ("/registry/value", "GET"):
                    {
                        string? keyRaw = request.QueryString["key"];
                        string? key = HttpUtility.UrlDecode(keyRaw);
                        if (!string.IsNullOrEmpty(key))
                        {
                            var value = RegistryManager.GetValue(key);
                            responseString = SerializeToJson(value);
                        }
                        else
                        {
                            ErrorContainer error = new ErrorContainer("Invalid request");
                            responseString = SerializeToJson(error);
                            responseStatus = 400;
                        }
                        break;
                    }
                case ("/registry/value", "POST"):
                    {
                        string? keyRaw = request.QueryString["key"];
                        string? key = HttpUtility.UrlDecode(keyRaw);
                        RegistryValueContainer? value = await ReadJsonAsync<RegistryValueContainer>(request);
                        if (value != null && !string.IsNullOrEmpty(key))
                        {
                            RegistryManager.SetValue($"{key}\\{value.Key}", value.Value, value.Kind);
                            responseString = string.Empty;
                            responseStatus = 204;
                        }
                        else
                        {
                            ErrorContainer error = new ErrorContainer("Invalid request");
                            responseString = SerializeToJson(error);
                            responseStatus = 400;
                        }
                        break;
                    }
                case ("/registry/value", "DELETE"):
                    {
                        string? keyRaw = request.QueryString["key"];
                        string? key = HttpUtility.UrlDecode(keyRaw);
                        if (!string.IsNullOrEmpty(key))
                        {
                            RegistryManager.DeleteValue(key);
                            responseString = string.Empty;
                            responseStatus = 204;
                        }
                        else
                        {
                            ErrorContainer error = new ErrorContainer("Invalid request");
                            responseString = SerializeToJson(error);
                            responseStatus = 400;
                        }
                        break;
                    }
                default:
                    {
                        ErrorContainer error = new ErrorContainer("Not Found");
                        responseString = SerializeToJson(error);
                        responseStatus = 404;
                        break;
                    }
            }
        }
        catch (Exception e)
        {
            ErrorContainer error = new ErrorContainer(e);
            Console.WriteLine(e.ToString());
            responseString = SerializeToJson(error);
            responseStatus = 500;
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
        await response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
        response.OutputStream.Close();
    }
}