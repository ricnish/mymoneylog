/**
 * myMoneyLog translation messages
 * save as UTF-8 file format
 */
mlog.translation = {
centschar: '.',
thousandchar: ',',
'datasample': '2000-01-01\t0.00\tinitial value\t\tbank\n2000-01-01\t0.00\tinitial value\t\tinvestment\n2000-01-01\t0.00\tinitial value\t\twallet\n2000-01-01\t0.00\tinitial value\t\tcredit card\n2000-01-01\t0.00\tinitial value\tautomobile\t\n2000-01-01\t0.00\tinitial value\tbank\t\n2000-01-01\t0.00\tinitial value\teducation\t\n2000-01-01\t0.00\tinitial value\tincome\t\n2000-01-01\t0.00\tinitial value\tentertainment\t\n2000-01-01\t0.00\tinitial value\tgrocery\t\n2000-01-01\t0.00\tinitial value\thome\t\n2000-01-01\t0.00\tinitial value\tothers\t\n2000-01-01\t0.00\tinitial value\thealth\t\n2000-01-01\t0.00\tinitial value\tclothing\t\n2000-01-01\t0.00\tinitial value\tgifts\t\n',
'help text': '<h1>Using</h1><h3>Categories and Accounts</h3>As you insert or delete them, the summary will be updated automatically.<h3>Entries</h3><ul><li><span>Date format: Year-Month-Day, 4 digits for year, 2 digits for month and day<br/>e.g. jan, 4 of 2008: 2008-01-04</span></li><li><span>Value: put the negative signal (-) for debits, e.g.: -100,00</span></li><li><span>Description: avoid special characters</span></li><li><span>Category and Account fields: have auto complete support, type any key and a list will be displayed, <b>press ESC key to hide the auto complete list</b>, if necessary</span></li><li><span>Multi-categories: to add more than one category, just separe them with "; " (semicolon + space).</span></li></ul><h3>Editing and Deleting</h3>To delete an entry, press the delete icon <img src="images/delete.png"></img> of it.<br/>Note that the excluded entry will be displayed in the entry input form, to edit or undo your deletion just add the entry again.<h3>Recurring entries</h3>To insert recurring entries, type the data normally, and specify the amount of times in the value field, e.g.:<br/>Annual rent fee of 600,00 (12 times) with due data starting in 2008-01-05<br/><code>date: 2008-01-05<br/>value: -600*12<br/>description: rent fee<br/>category: home<br/>account: bank<br/></code><br/>Note the star signal <b>*</b> meaning times.<br/><br/>Another example would be the purchase of a gift with the value 550,00 divided in 10 times, in the value field type: -550/10<br/><code>date: 2008-01-10<br/>value: -550/10<br/>description: my gift<br/>category: gift<br/>account: credit card<br/></code><br/>10 entries of -55,00 will be made on each day 10.<br/>Beware that some rounding can occur.<h3>Reconcilable entries</h3>To insert a reconcilable entry put a question mark after the date. Until the entry is accepted by pressing the accept icon <img src="images/accept.png"></img> its value will not be considered and its date, if expired, will be the current.<code>date: 2008-01-01?</code><h3>Transfers</h3>To make a transfer, leave the category field empty, when moving to the "from account" a new field will appear: "to account", type the origin and the target in each field, by pressing the add button two entries will be made: a debit and a credit.<h3>Data Editor</h3>Use the data editor feature to edit the text data source, it is very handy in some cases.<br/>Each field is TAB separated, just press apply to save your changes, a backup file with a "old" file extension is generated with the previous data.<h3>Search and Filter</h3>The entries can be easily filtered by typing in the filter field.<br/>To perform advanced filtering, use the regular expression option. <p>Examples:<br/>To filter the "entertainment" entries of January 2008:</p><code>2008-01.+entertainment</code>Filtering "entertainment" and "gift" entries:<code>2008-01.+(entertainment|gift)</code><h3>Data exportation</h3>Javascript is not a good solution to work with a large amount of data, so it is recommended to work with about +/-5000 entries or one year. To manage that you can, by the end/begin of the year (or another period), export the data, copy the entire myMoneyLog folder to another place and rewrite the file "data.html" with the one you exported. Doing that you can keep the history of each period in different folders.<h3>Enabling data writings</h3>To enable the data storage in Opera (Linux/Windows) or Safari (Windows) browsers, it is necessary to have java runtime installed in the operation system and to execute a script to enable its usage by myMoneyLog.<br/>To do it, inside myMoneyLog\'s folder, open the "applets" folder and run the script "config.bat" for Windows, or "config.sh" under Linux. You must run this script whenever you change the installation path.<br/><br/><br/>'
};

/**
 * calendar-en.js included from jscalendar
 */
// ** I18N

// Calendar EN language
// Author: Mihai Bazon, <mihai_bazon@yahoo.com>
// Encoding: any
// Distributed under the same terms as the calendar itself.

// For translators: please use UTF-8 if possible.  We strongly believe that
// Unicode is the answer to a real internationalized world.  Also please
// include your contact information in the header, as can be seen above.

// full day names
Calendar._DN = new Array
("Sunday",
 "Monday",
 "Tuesday",
 "Wednesday",
 "Thursday",
 "Friday",
 "Saturday",
 "Sunday");

// Please note that the following array of short day names (and the same goes
// for short month names, _SMN) isn't absolutely necessary.  We give it here
// for exemplification on how one can customize the short day names, but if
// they are simply the first N letters of the full name you can simply say:
//
//Calendar._SDN_len = N; // short day name length
//Calendar._SMN_len = N; // short month name length
//
// If N = 3 then this is not needed either since we assume a value of 3 if not
// present, to be compatible with translation files that were written before
// this feature.

// short day names
Calendar._SDN = new Array
("Sun",
 "Mon",
 "Tue",
 "Wed",
 "Thu",
 "Fri",
 "Sat",
 "Sun");

// First day of the week. "0" means display Sunday first, "1" means display
// Monday first, etc.
Calendar._FD = 0;

// full month names
Calendar._MN = new Array
("January",
 "February",
 "March",
 "April",
 "May",
 "June",
 "July",
 "August",
 "September",
 "October",
 "November",
 "December");

// short month names
Calendar._SMN = new Array
("Jan",
 "Feb",
 "Mar",
 "Apr",
 "May",
 "Jun",
 "Jul",
 "Aug",
 "Sep",
 "Oct",
 "Nov",
 "Dec");

// tooltips
Calendar._TT = {};
Calendar._TT["INFO"] = "About the calendar";

Calendar._TT["ABOUT"] =
"DHTML Date/Time Selector\n" +
"(c) dynarch.com 2002-2005 / Author: Mihai Bazon\n" + // don't translate this this ;-)
"For latest version visit: http://www.dynarch.com/projects/calendar/\n" +
"Distributed under GNU LGPL.  See http://gnu.org/licenses/lgpl.html for details." +
"\n\n" +
"Date selection:\n" +
"- Use the \xab, \xbb buttons to select year\n" +
"- Use the " + String.fromCharCode(0x2039) + ", " + String.fromCharCode(0x203a) + " buttons to select month\n" +
"- Hold mouse button on any of the above buttons for faster selection.";
Calendar._TT["ABOUT_TIME"] = "\n\n" +
"Time selection:\n" +
"- Click on any of the time parts to increase it\n" +
"- or Shift-click to decrease it\n" +
"- or click and drag for faster selection.";

Calendar._TT["PREV_YEAR"] = "Prev. year (hold for menu)";
Calendar._TT["PREV_MONTH"] = "Prev. month (hold for menu)";
Calendar._TT["GO_TODAY"] = "Go Today";
Calendar._TT["NEXT_MONTH"] = "Next month (hold for menu)";
Calendar._TT["NEXT_YEAR"] = "Next year (hold for menu)";
Calendar._TT["SEL_DATE"] = "Select date";
Calendar._TT["DRAG_TO_MOVE"] = "Drag to move";
Calendar._TT["PART_TODAY"] = " (today)";

// the following is to inform that "%s" is to be the first day of week
// %s will be replaced with the day name.
Calendar._TT["DAY_FIRST"] = "Display %s first";

// This may be locale-dependent.  It specifies the week-end days, as an array
// of comma-separated numbers.  The numbers are from 0 to 6: 0 means Sunday, 1
// means Monday, etc.
Calendar._TT["WEEKEND"] = "0,6";

Calendar._TT["CLOSE"] = "Close";
Calendar._TT["TODAY"] = "Today";
Calendar._TT["TIME_PART"] = "(Shift-)Click or drag to change value";

// date formats
Calendar._TT["DEF_DATE_FORMAT"] = "%Y-%m-%d";
Calendar._TT["TT_DATE_FORMAT"] = "%a, %b %e";

Calendar._TT["WK"] = "wk";
Calendar._TT["TIME"] = "Time:";
