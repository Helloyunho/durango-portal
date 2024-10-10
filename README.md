# Durango Portal

Packed with useful utils for Xbox One/Series consoles.

## Building

1. Prepare **Windows** environment
   - .NET SDK 8.0
   - Windows SDK **10.0.22621.0**
   - Node.js or Bun
2. Clone the repository
3. Build the client
   - `cd client`
   - `npm install` or `bun install`
   - `npm run build` or `bun build`
4. Copy `C:\Windows\System32\WinMetadata\Windows.Xbox.winmd` from Xbox to `server/winmd/Windows.Xbox.winmd`
5. Build the server
   - `cd server`
   - `dotnet build`
   - Copy the contents in `bin/<config>/net8.0-windows10.0.22621.0` to your USB drive or Xbox using sftp

## Running

1. (Only do this once) Download .NET SDK 8.0 Windows x64 Binaries from [here](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
2. (Also do this once) Unzip the binaries and copy it to your USB drive or Xbox using sftp
3. (If you're using a USB drive) Plug the USB drive into your Xbox
4. Open reverse shell on your Xbox and navigate(cd) to .NET folder
5. Run the server
   - `dotnet path\to\durango-portal.dll`
6. Open the browser and navigate to `http://XBOX-IP-HERE:24`
