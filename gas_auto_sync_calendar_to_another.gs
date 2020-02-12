var scriptProperties = PropertiesService.getScriptProperties();
var nextSyncTokenKey = 'NEXT_SYNC_TOKEN';

function main(e) {
  var calendarId = e.calendarId;

  var optionalArgs = {
    'syncToken': getNextSyncToken(calendarId)
  };
  var events = Calendar.Events.list(calendarId, optionalArgs);

  if(events.items.length >= 1) {
    var calendar = CalendarApp.getDefaultCalendar();

    for (var i = 0; i < events.items.length; i++) {
      var event = events.items[i];
      if(event.status == "confirmed") {
        calendar.createEvent(event.summary + "#" + event.id, new Date(event.start.dateTime), new Date(event.end.dateTime));
      }
      else if(event.status == "cancelled") {
        var now = new Date();
        var oneYearsFromNow = new Date(now.getTime() + (24 * 7 * 4 * 12 * 60 * 60 * 1000));
        var candidates = calendar.getEvents(now, oneYearsFromNow, {search: event.id});
        if(candidates.length >= 1) {
          for (var i in candidates) {
            var cand = candidates[i];
            cand.deleteEvent();
          }
        }
      }
      else {
        console.log("unexpected status");
      }
    }
  }

  saveNextSyncToken(events.nextSyncToken);
}

function getNextSyncToken(calendarId) {
  var nextSyncToken = scriptProperties.getProperty(nextSyncTokenKey);
  if (nextSyncToken) {
    return nextSyncToken
  }

  var events = Calendar.Events.list(calendarId, {'timeMin': (new Date()).toISOString()});
  nextSyncToken = events.nextSyncToken;
  return nextSyncToken;
}

function saveNextSyncToken(nextSyncToken) {
  scriptProperties.setProperty(nextSyncTokenKey, nextSyncToken);
}