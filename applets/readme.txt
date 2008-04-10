TiddlySaver
This is a helper from TiddlyWiki:

To allow data writing for Opera or Safari browsers is used an java applet, but it is necessary to configure some permission for the jvm perform this task.

In Windows run the config.bat script, by double clicking the bat file.

in Linux execute the config.sh script:
./config.sh

For Mac OS X, sorry, I don't have one to test it, try the following:

*post from http://www.tiddlywiki.com/ - JeremyRuston, 13 August 2007 (created 21 August 2006)  adapted for myMoneyLog:

Before you can use it, you need to give it the necessary privileges by editting your .java.policy file.

For Windows, the file will be at C:\Documents and Settings\your-user-name\.java.policy. Add the following lines (substituting the directory of your TiddlyWiki file as appropriate):

grant codeBase "file:${user.home}/My Documents/mymoneylog/*" {
  permission java.io.FilePermission "${user.home}${/}My Documents${/}mymoneylog${/}*", "read,write";
};

On Mac OS X, the file is found at /Users/your-user-name/.java.policy:

grant codeBase "file:${user.home}/Documents/mymoneylog/*" {
  permission java.io.FilePermission "${user.home}${/}Documents${/}mymoneylog${/}*", "read,write";
};

If you have trouble setting up the permissions correctly, you can try granting broader permissions to the applet like this:

grant codeBase "file://localhost/home/users/Desktop/
TiddlySaver.jar"
 { permission java.security.AllPermission; };

  
Enjoy it.
