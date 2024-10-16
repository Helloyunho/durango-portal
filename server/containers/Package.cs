using Windows.ApplicationModel;

class PackageContainer
{
    public string Name { get; init; }
    public string Id { get; init; }
    public string Publisher { get; init; }

    public PackageContainer(Package package)
    {
        Name = package.DisplayName;
        Id = package.Id.FullName;
        Publisher = package.PublisherDisplayName;
    }
}