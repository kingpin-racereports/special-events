from speedhive.wrapper import SpeedhiveClient

client = SpeedhiveClient.create()
print("METHODS:", [m for m in dir(client) if not m.startswith("_")])

events = client.get_events(org_id=209312, limit=5)
print("\nFirst event raw structure:")
print(events[0])