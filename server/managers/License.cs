using System.Text;
using System.Xml;
using Microsoft.Data.Sqlite;
using SQLitePCL;

class LicenseManager
{
    static string ClipDrive = "S:\\";

    static string LicenseDir = Path.Combine(ClipDrive, "clip");
    static string LicenseDB = Path.Combine(ClipDrive, "ProgramData", "Microsoft", "Windows", "AppRepository", "StateRepository-Machine.srd");

    public static IEnumerable<LicenseContainer> ListLicenses()
    {
        if (Directory.Exists(LicenseDir) && File.Exists(LicenseDB))
        {
            using (SqliteConnection connection = new SqliteConnection($"Data Source={LicenseDB}"))
            {
                raw.SetProvider(new SQLite3Provider_winsqlite3());
                connection.Open();
                var files = Directory.GetFiles(LicenseDir, "*", SearchOption.TopDirectoryOnly);
                foreach (string file in files)
                {
                    Guid licenseID;
                    if (!Guid.TryParse(Path.GetFileNameWithoutExtension(file), out licenseID))
                    {
                        Console.WriteLine($"Invalid license file {file} (invalid GUID), skipping...");
                        continue;
                    }
                    XmlTextReader licenseXMLReader = new XmlTextReader(file);
                    licenseXMLReader.Namespaces = false;

                    XmlDocument licenseXML = new XmlDocument();
                    licenseXML.Load(licenseXMLReader);

                    string? signedLicenseBase64 = licenseXML.DocumentElement!.SelectSingleNode("/SignedLicense")?.InnerText;
                    if (string.IsNullOrEmpty(signedLicenseBase64))
                    {
                        Console.WriteLine($"Invalid license file {file} (missing SignedLicense), skipping...");
                        continue;
                    }
                    else
                    {
                        XmlTextReader signedLicenseXMLReader = new XmlTextReader(new StringReader(Encoding.UTF8.GetString(Convert.FromBase64String(signedLicenseBase64))));
                        signedLicenseXMLReader.Namespaces = false;

                        XmlDocument signedLicenseXML = new XmlDocument();
                        signedLicenseXML.Load(signedLicenseXMLReader);

                        string? keyIDString = signedLicenseXML.SelectSingleNode("/SignedLicense/SVLicense/KeyId")?.InnerText;
                        if (string.IsNullOrEmpty(keyIDString))
                        {
                            throw new Exception($"Invalid license file {file} (missing KeyID)");
                        }
                        else
                        {
                            Guid keyID = Guid.Parse(keyIDString);
                            using (SqliteCommand keyIDQueryCommand = connection.CreateCommand())
                            {
                                keyIDQueryCommand.CommandText = "SELECT PackageFullName, DisplayName, PublisherDisplayName FROM Package JOIN XboxPackage ON XboxPackage.Package = Package._PackageID WHERE XboxPackage.EscrowedKeyBlobId = $keyID LIMIT 1";
                                keyIDQueryCommand.Parameters.AddWithValue("$keyID", keyID.ToByteArray());
                                using (SqliteDataReader reader = keyIDQueryCommand.ExecuteReader())
                                {
                                    if (reader.Read())
                                    {
                                        yield return new LicenseContainer(licenseID.ToString(), reader.GetString(0), reader.GetString(1), reader.GetString(2));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public static void BackupLicenses(string backupDir)
    {
        if (!Directory.Exists(backupDir))
        {
            Directory.CreateDirectory(backupDir);
        }

        if (Directory.Exists(Path.Combine(ClipDrive, "clip")))
        {
            string[] files = Directory.GetFiles("S:\\", "*", SearchOption.TopDirectoryOnly);
            foreach (string file in files)
            {
                string fileName = Path.GetFileName(file);
                try
                {
                    File.Copy(file, Path.Combine(backupDir, fileName), true);
                }
                catch (UnauthorizedAccessException)
                {
                    // pass
                }
            }
        }
    }

    public static void BackupLicense(string licenseID, string backupDir)
    {
        Guid licenseGuid = Guid.Parse(licenseID);
        if (!Directory.Exists(backupDir))
        {
            Directory.CreateDirectory(backupDir);
        }

        if (Directory.Exists(Path.Combine(ClipDrive, "clip")))
        {
            string[] files = Directory.GetFiles("S:\\", $"{licenseGuid}*", SearchOption.TopDirectoryOnly);
            foreach (string file in files)
            {
                string fileName = Path.GetFileName(file);
                try
                {
                    File.Copy(file, Path.Combine(backupDir, fileName), true);
                }
                catch (UnauthorizedAccessException)
                {
                    // pass
                }
            }
        }
    }
}