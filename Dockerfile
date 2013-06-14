# /tmp/redis.dockerfile
FROM ubuntu:12.04

# changing this field can be used to force a re-download of the dockyard script
ENV BUILT_ON 2013-06-09

RUN apt-get update && apt-get install curl -y
RUN curl https://raw.github.com/dynport/dockyard/master/dockyard -o /usr/local/bin/dockyard && chmod 0755 /usr/local/bin/dockyard

ENV REDIS_VERSION 2.6.13
RUN dockyard install redis $REDIS_VERSION

ENV RUBY_VERSION 2.0.0-p195
RUN dockyard install ruby $RUBY_VERSION

ENV NGINX_VERSION 1.4.1
RUN dockyard install nginx $NGINX_VERSION

ENV POSTGRESQL_VERSION 9.2.4
RUN dockyard install postgresql $POSTGRESQL_VERSION

ENV MEMCACHED_VERSION 1.4.15
RUN dockyard install memcached $MEMCACHED_VERSION

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
RUN bash -c "echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' > /etc/apt/sources.list.d/10gen.list"
RUN apt-get -y update
RUN apt-get -y install mongodb-10gen

RUN apt-get -y install python-software-properties python g++ make vim git wget
RUN wget -N http://nodejs.org/dist/node-latest.tar.gz
RUN tar xzvf node-latest.tar.gz && cd node-v* && ./configure && make && make install

RUN useradd user
RUN mkdir /runnable
ADD dockworker.js /runnable/dockworker.js
ADD hello.js /root/hello.js
RUN chmod +x /runnable/dockworker.js
EXPOSE 80
EXPOSE 9001
CMD /runnable/dockworker.js

