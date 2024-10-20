class LicenseContainer
{
    public string LicenseID { get; init; }
    public string PackageID { get; init; }
    public string Name { get; init; }
    public string Publisher { get; init; }

    public LicenseContainer(string licenseID, string packageID, string name, string publisher)
    {
        LicenseID = licenseID;
        PackageID = packageID;
        Name = name;
        Publisher = publisher;
    }
}
