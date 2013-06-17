# runnable base
FROM ubuntu:12.10

# changing this field can be used to force a re-download of the dockyard script
ENV BUILT_ON 2013-06-09

# dockyard
RUN apt-get update && apt-get install curl -y
RUN curl https://raw.github.com/dynport/dockyard/master/dockyard -o /usr/local/bin/dockyard && chmod 0755 /usr/local/bin/dockyard

# redis
ENV REDIS_VERSION 2.6.13
RUN dockyard install redis $REDIS_VERSION

# ruby
ENV RUBY_VERSION 2.0.0-p195
RUN dockyard install ruby $RUBY_VERSION

# nginx
ENV NGINX_VERSION 1.4.1
RUN dockyard install nginx $NGINX_VERSION

# postgres
ENV POSTGRESQL_VERSION 9.2.4
RUN dockyard install postgresql $POSTGRESQL_VERSION

# memcached
ENV MEMCACHED_VERSION 1.4.15
RUN dockyard install memcached $MEMCACHED_VERSION

# node.js
RUN apt-get -y install python-software-properties python g++ make vim git wget
RUN wget -N http://nodejs.org/dist/node-latest.tar.gz
RUN tar xzvf node-latest.tar.gz && cd node-v* && ./configure && make && make install

# couchdb
RUN apt-get -y install build-essential erlang libicu-dev libmozjs-dev libcurl4-openssl-dev
RUN wget -N http://www.eng.lsu.edu/mirrors/apache/couchdb/source/1.3.0/apache-couchdb-1.3.0.tar.gz
RUN tar xzvf apache-couchdb-1.3.0.tar.gz && cd apache-couchdb-1.3.0 && ./configure && make && make install

# mongo
RUN apt-get -y install git-core scons
RUN git clone git://github.com/mongodb/mongo.git
RUN cd mongo && git checkout r2.5.0 && scons all && scons install

# mysql
RUN apt-get -y install cmake ncurses-dev
RUN wget http://dev.mysql.com/get/Downloads/MySQL-5.5/mysql-5.5.15.tar.gz/from/http://mysql.oss.eznetsols.org/
RUN tar xzvf mysql-5.5.15.tar.gz && cd mysql-5.5.15 && cmake . -DCMAKE_INSTALL_PREFIX=/usr/local/mysql5 -DMYSQL_TCP_PORT=3306  -DMYSQL_UNIX_ADDR=/tmp/mysql.sock && make && make install

# apache
# http://mirror.olnevhost.net/pub/apache//httpd/httpd-2.4.4.tar.gz

# config
RUN mkdir /runnable
ADD dockworker.js /runnable/dockworker.js
ADD hello.js /root/hello.js
RUN chmod +x /runnable/dockworker.js
EXPOSE 80
EXPOSE 9001
CMD /runnable/dockworker.js

