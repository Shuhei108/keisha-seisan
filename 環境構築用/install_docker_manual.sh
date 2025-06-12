#!/bin/bash

set -e  # エラーがあれば即終了
echo "=== Docker 手動インストール開始 ==="

# 1. 必要パッケージのインストール
echo "--- 必要なツールをインストール (curl, tar) ---"
sudo dnf install -y curl tar

# 2. Docker バイナリのダウンロードと解凍
DOCKER_VERSION="24.0.7"
echo "--- Docker バイナリをダウンロード (v$DOCKER_VERSION) ---"
curl -LO https://download.docker.com/linux/static/stable/x86_64/docker-$DOCKER_VERSION.tgz

echo "--- Docker を展開して /usr/local/bin に配置 ---"
tar xzvf docker-$DOCKER_VERSION.tgz
sudo cp docker/* /usr/local/bin/
rm -rf docker docker-$DOCKER_VERSION.tgz

# 3. systemd サービスファイルを配置
echo "--- Docker の systemd サービスファイルを設置 ---"
sudo curl -L -o /etc/systemd/system/docker.service https://raw.githubusercontent.com/moby/moby/master/contrib/init/systemd/docker.service
sudo curl -L -o /etc/systemd/system/docker.socket https://raw.githubusercontent.com/moby/moby/master/contrib/init/systemd/docker.socket

# 4. systemd を再読み込みして Docker を有効化・起動
echo "--- systemd を再読み込みして Docker を起動 ---"
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable docker.service docker.socket
sudo systemctl start docker

# 5. Docker Compose v2 をインストール
DOCKER_COMPOSE_VERSION="v2.27.1"
echo "--- Docker Compose ($DOCKER_COMPOSE_VERSION) をインストール ---"
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-linux-x86_64 \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

# 6. バージョン・状態確認
echo "--- Docker バージョン確認 ---"
docker --version

echo "--- Docker Compose バージョン確認 ---"
docker compose version

echo "--- Docker サービス状態確認 ---"
sudo systemctl status docker --no-pager

echo "=== Docker 手動インストール完了 ==="
