#!/bin/sh 

TOKEN=$(printenv OPREDEEM_TOKEN)
ALLOW_NON_OFFICIAL=$(printenv ALLOW_NON_OFFICIAL)

mkdir plugins/OPRedeem
echo "token: $TOKEN" > plugins/OPRedeem/token.yaml

if [ "$ALLOW_NON_OFFICIAL" = "true" ]; then
    sed -i 's/online-mode=true/online-mode=false/g' server.properties
fi

java -Xms4096m -Xmx4096m -Dcom.mojang.eula.agree=true -jar server.jar