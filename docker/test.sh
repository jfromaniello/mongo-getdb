# prepare
./docker/prepare.sh
# run tests
docker-compose run --rm test npm run docker:test -e DEBUG=1
# cleanup
./docker/cleanup.sh