#!/bin/bash

RMC_BASE_URL='https://ssd.mathworks.com/supportfiles/ci/run-matlab-command/v2'
SUPPORTED_OS=('win64' 'maci64' 'maca64' 'glnxa64')

# Create dist directory if it doesn't already exist
DISTDIR="$(pwd)/dist/bin"
mkdir -p $DISTDIR

# Create plugin directory and copy plugin code
cp -R plugins $(pwd)/dist/

# Download and extract in a temporary directory
WORKINGDIR=$(mktemp -d -t rmc_build.XXXXXX)
cd $WORKINGDIR

wget -O  "$WORKINGDIR/license.txt" "$RMC_BASE_URL/license.txt"
wget -O  "$WORKINGDIR/thirdpartylicenses.txt" "$RMC_BASE_URL/thirdpartylicenses.txt"

for os in ${SUPPORTED_OS[@]}
do
    if [[ $os == 'win64' ]] ; then
        bin_ext='.exe'
    else
        bin_ext=''
    fi
    mkdir -p "$WORKINGDIR/$os"
    wget -O  "$WORKINGDIR/$os/run-matlab-command$bin_ext" "$RMC_BASE_URL/$os/run-matlab-command$bin_ext"
done

mv -f ./* "$DISTDIR/"
rm -rf $WORKINGDIR