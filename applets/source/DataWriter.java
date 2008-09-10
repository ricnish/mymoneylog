import java.io.FileOutputStream;
import java.security.AccessController;
import java.security.PrivilegedAction;

public class DataWriter extends java.applet.Applet {
  public int saveFile(final String filename, final String charset, final String data) {
    return ((Integer)AccessController.doPrivileged(new PrivilegedAction() {
      public Object run() {
        if (filename.toLowerCase().indexOf("data.html")<0) return new Integer(0);
        try {
          FileOutputStream fos = new FileOutputStream(filename);
          fos.write(data.getBytes(charset));
          fos.close();
          return new Integer(1);
        } catch (Exception e) {
          e.printStackTrace();
        }
        return new Integer(0);
      }
    })).intValue();
  }
}