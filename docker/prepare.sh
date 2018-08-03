# run `npm i` (removes the copied node_modules folder just in case it it has come from an OSx machine)
echo 'Installing npm dependencies...'
docker-compose run --rm test npm install
