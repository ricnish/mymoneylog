javac -source 1.2 -target 1.2 -g:none DataWriter.java
jar cvf DataWriter.jar DataWriter*.class
keytool -genkey -alias myMoneyLog
keytool -selfcert -alias myMoneyLog
jarsigner DataWriter.jar myMoneyLog