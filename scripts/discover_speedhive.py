# scripts/discover_speedhive.py
from speedhive.wrapper import SpeedhiveClient

client = SpeedhiveClient.create()  # if this fails, try SpeedhiveClient()

print("Client methods:", [m for m in dir(client) if not m.startswith("_")])

events = client.get_events(org_id=209312, limit=1)
print("\nFirst event raw structure:")
print(events[0])