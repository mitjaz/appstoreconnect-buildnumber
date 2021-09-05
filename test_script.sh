#!/bin/bash

export API_KEY=`cat AuthKey_xxxxxxxxxx.p8`
export API_KEY_ID="xxxxxxxxxx"
export ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

val=$(npx appstoreconnect-buildnumber 1234567890 "1.0.0")
echo "node returned: $val"