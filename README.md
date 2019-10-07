# Instalando imagens via Docker para o Backend

docker run --name database -e POSTGRES_PASSWORD=docker -p 5432:5432 postgres
docker run --name redismeetup -p 6379:6379 -d -t redis:alpine
docker run --name mongomeetup -p 27017:27017 -d -t mongo

## Ativando as images instaladas

- Abra um terminal e digite:

docker start database
docker start redismeetup
docker start mongomeetup

- podemos visualizar se estão rodando usando o comando abaixo

docker ps

## Modo operantes

- Acesse a pasta onde você salvou os fontes da aplicação, abra um segundo terminal e digite o camando abaixo para rodar a aplicação:

yarn dev

- Em um terceiro terminal, digite o comando abaixo para rodar nossa fila de notificações:

yarn queue

## Usando o Insomnia teste as funcionalidades do aplicativo!!!

By: Losangelo Pacífico, aluno do 8º bootcamp da RockSeat 2019.
email: losangelo@gmail.com
