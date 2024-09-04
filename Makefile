all:
	mkdir -p front/docker-storage back/docker-storage database
	docker-compose up -d --build

build:
	mkdir -p front/docker-storage back/docker-storage database
	docker-compose -f docker-compose-build.yml up -d --build

down:
	docker-compose down -v

up:
	docker-compose up -d

clean: down
	docker system prune -af --volumes

fclean: down
	docker system prune -af --volumes

re: fclean
	@make all

ls:
	@docker ps -a
	@echo
	@docker volume ls
	@echo
	@docker images

.PHONY: all down up clean fclean ls lint lint-fix install re