#! /bin/sh

wget http://ultra3d.sba.gov/foia/foia.tar.gz
tar -C foia/dump  -zxvf foia.tar.gz
node foia/tasks/import.js