# Build the Spigot Server
FROM amazoncorretto:17-alpine3.16 as SPIGOT_BUILDER
WORKDIR /spigot
ARG version=1.19.4
RUN apk update && apk add curl git
RUN curl -o BuildTools.jar https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar
RUN java -jar BuildTools.jar --rev $version --final-name server.jar


# Build the MineralContest Plugin
FROM maven:3.9.8-amazoncorretto-17-al2023 as MINERALCONTEST_BUILDER
WORKDIR /mineralcontest
RUN yum install -y git
RUN cd /mineralcontest && git clone https://github.com/synchroneyes/mineralcontest
RUN cd /mineralcontest/mineralcontest && mvn clean install

# Create the final image
FROM amazoncorretto:17-alpine3.16 as MC_SERVER
WORKDIR /server
COPY --from=SPIGOT_BUILDER /spigot/server.jar server.jar
RUN chmod +x /server/server.jar
COPY MinecraftPlugins/OPRedeem.jar plugins/OPRedeem.jar
COPY --from=MINERALCONTEST_BUILDER /mineralcontest/mineralcontest/target/MineralContest.jar plugins/MineralContest.jar
COPY files/server.properties server.properties
COPY scripts/init.sh init.sh

RUN /usr/bin/dos2unix /server/init.sh
RUN chmod +x /server/init.sh

EXPOSE 25565
CMD ["/bin/sh", "/server/init.sh"]