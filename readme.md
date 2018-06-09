# Docker Image ubuntu-dev
Docker image to use as dev environment.

## Install
Si no existe ~/.Xauthority, hay que crearlo
```
touch ~/.Xauthority
xauth generate :0 . trusted
xauth add ${HOST}:0 . $(xxd -l 16 -p /dev/random)
xauth list
```

## Run
```
xhost +local:root
docker-compose run dev bash
xhost -local:root
```
To run javascrtip in atom first run:
```
ijsinstall
atom
```
