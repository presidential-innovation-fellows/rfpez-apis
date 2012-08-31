#! /bin/sh

wget http://ultra3d.sba.gov/foia/foia.tar.gz
tar -C _data/dsbs  -zxvf foia.tar.gz
node tasks/import_bizs.js