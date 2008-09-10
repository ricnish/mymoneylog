javac -source 1.2 -target 1.2 -g:none DataWriter.java
jar cv DataWriter.jar DataWriter*.class
rem keytool -genkey -alias myMoneyLog
rem keytool -selfcert -alias myMoneyLog
jarsigner DataWriter.jar myMoneyLog