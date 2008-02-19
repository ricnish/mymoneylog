rem script to configure java applet write permission 
echo off
set file="%homedrive%%homepath%\.java.policy"
set applethome=%cd%\*
cd ..
set apphome=%cd%\*

cd %applethome%

rem replace back slash
echo.%applethome%
set applethome=%applethome:\=/%

echo.%apphome%
set apphome=%apphome:\=/%
rem create file permission path
set appletpermission=%applethome%
echo.%appletpermission%
set appletpermission=%appletpermission:/=${/}%

set apppermission=%apphome%
echo.%apppermission%
set apppermission=%apppermission:/=${/}%

echo // myMoneyLog applet write permission >> %file%
echo grant codeBase "file:%applethome%" { >> %file%
echo   permission java.io.FilePermission "%apppermission%", "read,write"; >> %file%
echo }; >> %file%
echo grant codeBase "file:%apphome%" { >> %file%
echo   permission java.io.FilePermission "%apppermission%", "read,write"; >> %file%
echo }; >> %file%
echo permission done in: %file%
