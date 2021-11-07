VERSION="$1"
INSTALL_DIR="$2"

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
build_leveldb 84348b9b826cc280cde659185695d2170b54824c

rm -rf php-build
git clone https://github.com/pmmp/php-build.git
cd php-build
./install-dependencies.sh
echo '"pthreads",,"https://github.com/pmmp/pthreads.git",,,"extension",' >> share/php-build/extension/definition
echo '"leveldb",,"https://github.com/pmmp/php-leveldb.git",,"--with-leveldb='$INSTALL_DIR'","extension",' >> share/php-build/extension/definition
echo '"chunkutils2",,"https://github.com/pmmp/ext-chunkutils2.git",,,"extension",' >> share/php-build/extension/definition
echo '"morton",,"https://github.com/pmmp/ext-morton.git",,,"extension",' >> share/php-build/extension/definition
PHP_BUILD_INSTALL_EXTENSION="\
pthreads=@4.0.0 \
yaml=2.2.1 \
leveldb=@60763a09bf5c7a10376d16e25b078b99a35c5c37 \
chunkutils2=@0.3.1 \
morton=@0.1.2 \
igbinary=3.2.1 \
crypto=0.3.2 \
" PHP_BUILD_ZTS_ENABLE=on PHP_BUILD_CONFIGURE_OPTS='--with-gmp' ./bin/php-build "$VERSION" "$INSTALL_DIR" || exit 1

rm "$INSTALL_DIR/etc/conf.d/xdebug.ini" || true