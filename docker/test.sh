# prepare
./docker/prepare.sh
# run tests
docker-compose run -e MONGOMS_DEBUG=0 -e MONGOMS_VERSION=4.4.14 --rm test npm run test
# cleanup
./docker/cleanup.sh