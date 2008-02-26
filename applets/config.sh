#!/bin/bash
# Bash Script to configure java applet write permission
# 2008-02 - Ricardo Nishimura - written for myMoneyLog
# run it inside applet folder
# it will update java policy write permission for java applet
POLICYFILE=$HOME'/.java.policy'
APPLETHOME=$PWD
cd ..
APPHOME=$PWD
cd $APPLETHOME
APPPERMISSION=${APPHOME//\//\$\{\/\}}
echo '// myMoneyLog applet write permission' >> $POLICYFILE
echo 'grant codeBase "file:'$APPLETHOME'/*" {' >> $POLICYFILE
echo 'permission java.io.FilePermission "'$APPPERMISSION'${/}*","read,write";' >> $POLICYFILE
echo '};' >> $POLICYFILE
echo 'grant codeBase "file:'$APPHOME'/*" {' >> $POLICYFILE
echo 'permission java.io.FilePermission "'$APPPERMISSION'${/}*","read,write";' >> $POLICYFILE
echo '};' >> $POLICYFILE
echo permission done in: $POLICYFILE
