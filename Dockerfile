FROM aye0aye/demobase:master.5

# Bundle app source
RUN mkdir -p /root/radar-www
ADD . /root/radar-www/

ENV NODE_ENV="dev" WWW_PORT="3000" CONSOLE_LOGLEVEL="debug" API_PORT="3001" API_URL="http://default-environment-in376psmgq.elasticbeanstalk.com/"

# Install app dependencies
RUN cd /root/radar-www; npm install

ENTRYPOINT ["/root/radar-www/boot.sh"]
