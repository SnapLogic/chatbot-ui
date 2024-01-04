include .env

.PHONY: all

build:
	docker build -t chatbot-ui .

run:
	export $(cat .env | xargs)
	docker stop chatbot-ui || true && docker rm chatbot-ui || true
	docker run --name chatbot-ui --rm -e NEXT_PUBLIC_API_ENDPOINT=${NEXT_PUBLIC_API_ENDPOINT} -e NEXT_PUBLIC_BEARER_TOKEN=${NEXT_PUBLIC_BEARER_TOKEN} -p 80:80 chatbot-ui

logs:
	docker logs -f chatbot-ui

push:
	docker tag chatbot-ui:latest ${DOCKER_USER}/chatbot-ui:${DOCKER_TAG}
	docker push ${DOCKER_USER}/chatbot-ui:${DOCKER_TAG}