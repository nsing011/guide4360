#!/bin/bash

echo "=========================================="
echo "MONGODB DNS FIX - Adding hosts entries"
echo "=========================================="
echo ""
echo "This will add MongoDB server IPs to /etc/hosts to bypass DNS issues."
echo "You'll need to enter your password for sudo access."
echo ""

# Create backup
sudo cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ Backed up /etc/hosts"

# Add MongoDB entries
echo "" | sudo tee -a /etc/hosts > /dev/null
echo "# MongoDB Atlas Cluster - Added $(date)" | sudo tee -a /etc/hosts > /dev/null
echo "159.41.242.54 ac-rd6dw0c-shard-00-00.u4hedbc.mongodb.net" | sudo tee -a /etc/hosts > /dev/null
echo "159.41.242.63 ac-rd6dw0c-shard-00-01.u4hedbc.mongodb.net" | sudo tee -a /etc/hosts > /dev/null
echo "159.41.242.72 ac-rd6dw0c-shard-00-02.u4hedbc.mongodb.net" | sudo tee -a /etc/hosts > /dev/null

echo "✓ Added MongoDB server entries to /etc/hosts"
echo ""
echo "Now restart your dev server:"
echo "  pnpm dev"
echo ""
echo "To remove these entries later, run:"
echo "  sudo nano /etc/hosts"
echo "  (and delete the MongoDB lines)"

