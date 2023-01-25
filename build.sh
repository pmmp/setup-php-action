#!/bin/bash

VERSION="$1"
INSTALL_DIR="$2"
PM_VERSION_MAJOR="$3"

if [[ "$VERSION" == "" ]]; then
	echo "No version specified"
	exit 1
fi
if [[ "$INSTALL_DIR" == "" ]]; then
       echo "No install path specified"
       exit 1
fi
if [[ "$PM_VERSION_MAJOR" == "" ]]; then
       echo "No PocketMine-MP major version specified"
       exit 1
fi

sudo apt update && sudo apt install -y \
	re2c \
	libtool \
	libtool-bin \
	zlib1g-dev \
	libcurl4-openssl-dev \
	libxml2-dev \
	libyaml-dev \
	libgmp-dev \
	libzip-dev \
	libssl-dev

export CFLAGS="$CFLAGS -march=x86-64"
export CXXFLAGS="$CXXFLAGS -march=x86-64"

function build_leveldb {
	local LEVELDB_VERSION="$1"
	echo "Building LevelDB"
	rm -rf "./leveldb-mcpe" || true
	rm -rf "./leveldb-mcpe-build" || true
	mkdir "./leveldb-mcpe"
	curl -fsSL "https://github.com/pmmp/leveldb/archive/$LEVELDB_VERSION.tar.gz" | tar -zx
	mv "./leveldb-$LEVELDB_VERSION" leveldb-mcpe-build
	cd leveldb-mcpe-build
	CFLAGS="-fPIC" CXXFLAGS="-fPIC" cmake . \
		-DCMAKE_INSTALL_PREFIX="$INSTALL_DIR" \
		-DCMAKE_PREFIX_PATH="$INSTALL_DIR" \
		-DCMAKE_INSTALL_LIBDIR=lib \
		-DLEVELDB_BUILD_TESTS=OFF \
		-DLEVELDB_BUILD_BENCHMARKS=OFF \
		-DLEVELDB_SNAPPY=OFF \
		-DLEVELDB_ZSTD=OFF \
		-DLEVELDB_TCMALLOC=OFF \
		-DCMAKE_BUILD_TYPE=Release
	make -j4 install
	cd ..
}
build_leveldb 1c7564468b41610da4f498430e795ca4de0931ff

rm -rf php-build
git clone https://github.com/pmmp/php-build.git
cd php-build
./install-dependencies.sh

if [[ "$PM_VERSION_MAJOR" -ge "5" ]]; then
	PTHREADS="5.1.2"
else
	PTHREADS="4.2.0"
fi
echo $PTHREADS
echo '"pthreads",,"https://github.com/pmmp/pthreads.git",,,"extension",' >> share/php-build/extension/definition
echo '"leveldb",,"https://github.com/pmmp/php-leveldb.git",,"--with-leveldb='$INSTALL_DIR'","extension",' >> share/php-build/extension/definition
echo '"chunkutils2",,"https://github.com/pmmp/ext-chunkutils2.git",,,"extension",' >> share/php-build/extension/definition
echo '"morton",,"https://github.com/pmmp/ext-morton.git",,,"extension",' >> share/php-build/extension/definition
PHP_BUILD_INSTALL_EXTENSION="\
pthreads=@$PTHREADS \
yaml=2.2.2 \
leveldb=@317fdcd8415e1566fc2835ce2bdb8e19b890f9f3 \
chunkutils2=@0.3.3 \
morton=@0.1.2 \
igbinary=3.2.12 \
crypto=0.3.2 \
" PHP_BUILD_ZTS_ENABLE=on PHP_BUILD_CONFIGURE_OPTS='--with-gmp' ./bin/php-build "$VERSION" "$INSTALL_DIR" || exit 1

rm "$INSTALL_DIR/etc/conf.d/xdebug.ini" || true
