import Toybox.Activity;
import Toybox.ActivityMonitor;
import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.SensorHistory;
import Toybox.System;
import Toybox.Time;
import Toybox.Time.Gregorian;
import Toybox.UserProfile;
import Toybox.Weather;
import Toybox.WatchUi;

// Interpreter desain. Data elemen berasal dari source/gen/DesignData.mc yang dibuat
// oleh watchface/compile-design.mjs. Koordinat dalam satuan kanvas 390 x 390, sama
// dengan editor web, lalu diskalakan ke resolusi layar perangkat saat digambar.
module Kind {
    const TEXT = 0;
    const RECT = 1;
    const CIRCLE = 2;
    const ARC = 3;
    const TICKS = 4;
    const HANDS = 5;
}

// Urutan wajib sama dengan TEXT_METRICS di compile-design.mjs.
module Metric {
    const LABEL = 0;
    const TIME = 1;
    const DATE = 2;
    const BATTERY = 3;
    const STEPS = 4;
    const HEART_RATE = 5;
    const CALORIES = 6;
    const DISTANCE = 7;
    const NOTIFICATIONS = 8;
    const WEATHER = 9;
    const FLOORS = 10;
    const ACTIVE_MINUTES = 11;
    const STRESS = 12;
    const BODY_BATTERY = 13;
    const VO2MAX = 14;
    const ALTITUDE = 15;
    const TIMER = 16;
    const PACE = 17;
    const SPEED = 18;
    const CADENCE = 19;
    const LAP = 20;
}

const CANVAS = 390.0;
const NO_DATA = "--";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as Array<String>;

class WatchCraftView extends WatchUi.WatchFace {
    private var _elements as Array<Array<Number>> = [] as Array<Array<Number>>;
    private var _labels as Array<String> = [] as Array<String>;
    private var _lowPower as Boolean = false;

    private var _scale as Float = 1.0;
    private var _ox as Float = 0.0;
    private var _oy as Float = 0.0;

    private var _textFonts as Array<Graphics.FontDefinition> = [
        Graphics.FONT_XTINY,
        Graphics.FONT_TINY,
        Graphics.FONT_SMALL,
        Graphics.FONT_MEDIUM,
        Graphics.FONT_LARGE
    ] as Array<Graphics.FontDefinition>;
    private var _numberFonts as Array<Graphics.FontDefinition> = [
        Graphics.FONT_NUMBER_MILD,
        Graphics.FONT_NUMBER_MEDIUM,
        Graphics.FONT_NUMBER_HOT,
        Graphics.FONT_NUMBER_THAI_HOT
    ] as Array<Graphics.FontDefinition>;
    private var _textHeights as Array<Number> = [] as Array<Number>;
    private var _numberHeights as Array<Number> = [] as Array<Number>;
    private var _vectorCache as Dictionary<Number, Graphics.VectorFont> = {} as Dictionary<Number, Graphics.VectorFont>;

    public function initialize() {
        WatchFace.initialize();
        _elements = DesignData.elements();
        _labels = DesignData.labels();
    }

    public function onLayout(dc as Graphics.Dc) as Void {
        var w = dc.getWidth();
        var h = dc.getHeight();
        var side = w < h ? w : h;
        _scale = side / CANVAS;
        _ox = (w - side) / 2.0;
        _oy = (h - side) / 2.0;

        _textHeights = [] as Array<Number>;
        for (var i = 0; i < _textFonts.size(); i += 1) {
            _textHeights.add(Graphics.getFontHeight(_textFonts[i]));
        }
        _numberHeights = [] as Array<Number>;
        for (var i = 0; i < _numberFonts.size(); i += 1) {
            _numberHeights.add(Graphics.getFontHeight(_numberFonts[i]));
        }
    }

    public function onEnterSleep() as Void {
        _lowPower = true;
        WatchUi.requestUpdate();
    }

    public function onExitSleep() as Void {
        _lowPower = false;
        WatchUi.requestUpdate();
    }

    public function onUpdate(dc as Graphics.Dc) as Void {
        if (dc has :setAntiAlias) {
            dc.setAntiAlias(true);
        }

        var background = _lowPower ? Graphics.COLOR_BLACK : DesignData.BACKGROUND;
        dc.setColor(background, background);
        dc.clear();

        for (var i = 0; i < _elements.size(); i += 1) {
            var el = _elements[i];
            if (_lowPower && el[1] == 0) {
                continue;
            }
            var kind = el[0];
            if (kind == Kind.TEXT) {
                drawTextElement(dc, el);
            } else if (kind == Kind.RECT) {
                drawRect(dc, el);
            } else if (kind == Kind.CIRCLE) {
                drawCircleElement(dc, el);
            } else if (kind == Kind.ARC) {
                drawArcElement(dc, el);
            } else if (kind == Kind.TICKS) {
                drawTicks(dc, el);
            } else if (kind == Kind.HANDS) {
                drawHands(dc, el);
            }
        }
    }

    // ---------- Geometri ----------

    private function sx(value as Numeric) as Numeric {
        return _ox + value * _scale;
    }

    private function sy(value as Numeric) as Numeric {
        return _oy + value * _scale;
    }

    private function len(value as Numeric) as Numeric {
        return value * _scale;
    }

    private function pen(width as Numeric) as Number {
        var w = Math.round(width * _scale).toNumber();
        return w < 1 ? 1 : w;
    }

    // Sudut 0 di jam 12, searah jarum jam. Sama dengan polar() di renderer web.
    private function polarX(cx as Numeric, r as Numeric, deg as Numeric) as Numeric {
        return sx(cx) + Math.sin(Math.toRadians(deg)) * len(r);
    }

    private function polarY(cy as Numeric, r as Numeric, deg as Numeric) as Numeric {
        return sy(cy) - Math.cos(Math.toRadians(deg)) * len(r);
    }

    private function line(dc as Graphics.Dc, x1 as Numeric, y1 as Numeric, x2 as Numeric, y2 as Numeric, width as Numeric, color as Number) as Void {
        var w = pen(width);
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(w);
        dc.drawLine(x1, y1, x2, y2);
        // Ujung bulat seperti stroke-linecap="round" di web.
        if (w >= 3) {
            dc.fillCircle(x1, y1, w / 2.0);
            dc.fillCircle(x2, y2, w / 2.0);
        }
    }

    // ---------- Elemen ----------

    private function drawRect(dc as Graphics.Dc, el as Array<Number>) as Void {
        var x = sx(el[2]);
        var y = sy(el[3]);
        var w = len(el[4]);
        var h = len(el[5]);
        var r = len(el[6]);
        var fill = el[7];
        var stroke = el[8];
        var strokeWidth = el[9];

        dc.setColor(fill, Graphics.COLOR_TRANSPARENT);
        if (r > 0) {
            dc.fillRoundedRectangle(x, y, w, h, r);
        } else {
            dc.fillRectangle(x, y, w, h);
        }

        if (stroke >= 0 && strokeWidth > 0) {
            dc.setColor(stroke, Graphics.COLOR_TRANSPARENT);
            dc.setPenWidth(pen(strokeWidth));
            if (r > 0) {
                dc.drawRoundedRectangle(x, y, w, h, r);
            } else {
                dc.drawRectangle(x, y, w, h);
            }
        }
    }

    private function drawCircleElement(dc as Graphics.Dc, el as Array<Number>) as Void {
        var cx = sx(el[2]);
        var cy = sy(el[3]);
        var r = len(el[4]);
        dc.setColor(el[5], Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(cx, cy, r);
        if (el[6] >= 0 && el[7] > 0) {
            dc.setColor(el[6], Graphics.COLOR_TRANSPARENT);
            dc.setPenWidth(pen(el[7]));
            dc.drawCircle(cx, cy, r);
        }
    }

    // Busur web: 0 derajat di jam 3, positif searah jarum jam (sumbu y ke bawah).
    // Garmin: 0 derajat di jam 3, positif berlawanan jarum jam. Jadi sudut dibalik tandanya.
    private function arcStroke(dc as Graphics.Dc, cx as Number, cy as Number, r as Number, start as Numeric, sweep as Numeric, width as Number, color as Number, roundCap as Boolean) as Void {
        var w = pen(width);
        dc.setColor(color, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(w);

        if (sweep >= 360) {
            dc.drawCircle(sx(cx), sy(cy), len(r));
            return;
        }

        var from = normalize(-start - sweep);
        var to = normalize(-start);
        dc.drawArc(sx(cx), sy(cy), len(r), Graphics.ARC_COUNTER_CLOCKWISE, from, to);

        if (roundCap && w >= 3) {
            var a1 = Math.toRadians(start);
            var a2 = Math.toRadians(start + sweep);
            dc.fillCircle(sx(cx) + Math.cos(a1) * len(r), sy(cy) + Math.sin(a1) * len(r), w / 2.0);
            dc.fillCircle(sx(cx) + Math.cos(a2) * len(r), sy(cy) + Math.sin(a2) * len(r), w / 2.0);
        }
    }

    private function normalize(deg as Numeric) as Number {
        var value = Math.round(deg).toNumber() % 360;
        return value < 0 ? value + 360 : value;
    }

    private function drawArcElement(dc as Graphics.Dc, el as Array<Number>) as Void {
        var cx = el[2];
        var cy = el[3];
        var r = el[4];
        var width = el[5];
        var start = el[8];
        var sweep = el[9];
        var roundCap = el[12] == 1;

        arcStroke(dc, cx, cy, r, start, sweep, width, el[6], roundCap);

        var value = arcValue(el[10]);
        var ratio = value / el[11].toFloat();
        if (ratio > 1.0) {
            ratio = 1.0;
        }
        var valueSweep = sweep * ratio;
        if (valueSweep >= 1.0) {
            arcStroke(dc, cx, cy, r, start, valueSweep, width, el[7], roundCap);
        }
    }

    private function drawTicks(dc as Graphics.Dc, el as Array<Number>) as Void {
        var cx = el[2];
        var cy = el[3];
        var outer = el[4];
        var count = el[5];
        var majorEvery = el[6];

        for (var i = 0; i < count; i += 1) {
            var major = i % majorEvery == 0;
            var deg = i * 360.0 / count;
            var tickLength = major ? el[8] : el[7];
            var width = major ? el[10] : el[9];
            var color = major ? el[12] : el[11];
            var inner = outer - tickLength;
            if (inner < 0) {
                inner = 0;
            }
            var edge = outer - width / 2.0;
            line(dc, polarX(cx, edge, deg), polarY(cy, edge, deg), polarX(cx, inner, deg), polarY(cy, inner, deg), width, color);
        }
    }

    private function drawHand(dc as Graphics.Dc, cx as Number, cy as Number, radius as Number, deg as Float, lengthPct as Number, width as Number, color as Number) as Void {
        var tail = radius * 0.1;
        var tip = radius * lengthPct / 100.0;
        line(dc, polarX(cx, tail, deg + 180), polarY(cy, tail, deg + 180), polarX(cx, tip, deg), polarY(cy, tip, deg), width, color);
    }

    private function drawHands(dc as Graphics.Dc, el as Array<Number>) as Void {
        var cx = el[2];
        var cy = el[3];
        var radius = el[4];
        var clock = System.getClockTime();
        var hourDeg = ((clock.hour % 12) + clock.min / 60.0) * 30.0;
        var minuteDeg = (clock.min + clock.sec / 60.0) * 6.0;
        var secondDeg = clock.sec * 6.0;

        drawHand(dc, cx, cy, radius, hourDeg, el[5], el[8], el[11]);
        drawHand(dc, cx, cy, radius, minuteDeg, el[6], el[9], el[12]);
        // Mode always-on hanya update tiap menit, jarum detik akan diam dan menipu.
        if (el[10] > 0 && !_lowPower) {
            drawHand(dc, cx, cy, radius, secondDeg, el[7], el[10], el[13]);
        }
        if (el[14] > 0) {
            dc.setColor(el[15], Graphics.COLOR_TRANSPARENT);
            dc.fillCircle(sx(cx), sy(cy), len(el[14]));
        }
    }

    private function drawTextElement(dc as Graphics.Dc, el as Array<Number>) as Void {
        var text = metricText(el[4], el[10]);
        if (text.length() == 0) {
            return;
        }
        var size = el[5] * _scale;
        var font = vectorFont(size, el[7] == 2);
        if (font == null) {
            font = pickFont(size, el[6] == 2 && isNumeric(text));
        }
        var align = el[9];
        var justify = Graphics.TEXT_JUSTIFY_CENTER;
        if (align == 0) {
            justify = Graphics.TEXT_JUSTIFY_LEFT;
        } else if (align == 2) {
            justify = Graphics.TEXT_JUSTIFY_RIGHT;
        }

        dc.setColor(el[8], Graphics.COLOR_TRANSPARENT);
        dc.drawText(sx(el[2]), sy(el[3]), font, text, justify | Graphics.TEXT_JUSTIFY_VCENTER);
    }

    // Font TTF sistem (API 4.2+) bisa dibuat di ukuran persis seperti web.
    // Hasilnya di-cache karena onUpdate dipanggil tiap detik.
    private function vectorFont(size as Numeric, bold as Boolean) as Graphics.VectorFont? {
        if (!(Graphics has :getVectorFont)) {
            return null;
        }
        var px = Math.round(size).toNumber();
        if (px < 8) {
            px = 8;
        }
        var key = (bold ? 1000 : 0) + px;
        if (_vectorCache.hasKey(key)) {
            return _vectorCache[key];
        }
        var face = bold
            ? ["RobotoCondensedBold", "RobotoRegular"]
            : ["RobotoRegular", "RobotoCondensedRegular"];
        var font = Graphics.getVectorFont({ :face => face, :size => px });
        if (font != null) {
            _vectorCache[key] = font;
        }
        return font;
    }

    // Fallback tanpa font TTF: pilih font bitmap yang tingginya paling dekat dengan ukuran web.
    private function pickFont(size as Float, numeric as Boolean) as Graphics.FontDefinition {
        var fonts = numeric ? _numberFonts : _textFonts;
        var heights = numeric ? _numberHeights : _textHeights;
        var target = numeric ? size * 1.05 : size * 1.25;
        var best = 0;
        var bestDiff = 100000.0;
        for (var i = 0; i < heights.size(); i += 1) {
            var diff = (heights[i] - target).abs();
            if (diff < bestDiff) {
                bestDiff = diff;
                best = i;
            }
        }
        return fonts[best];
    }

    private function isNumeric(text as String) as Boolean {
        var chars = text.toCharArray();
        for (var i = 0; i < chars.size(); i += 1) {
            var c = chars[i];
            var ok = (c >= '0' && c <= '9') || c == ':' || c == '.';
            if (!ok) {
                return false;
            }
        }
        return true;
    }

    // ---------- Data ----------

    private function arcValue(metric as Number) as Float {
        if (metric == 0) {
            return System.getSystemStats().battery;
        }
        if (metric == 1) {
            var steps = ActivityMonitor.getInfo().steps;
            return steps == null ? 0.0 : steps.toFloat();
        }
        var hr = heartRate();
        return hr == null ? 0.0 : hr.toFloat();
    }

    private function heartRate() as Number? {
        var info = Activity.getActivityInfo();
        if (info != null && info.currentHeartRate != null) {
            return info.currentHeartRate;
        }
        var history = ActivityMonitor.getHeartRateHistory(1, true);
        var sample = history.next();
        if (sample != null && sample.heartRate != ActivityMonitor.INVALID_HR_SAMPLE) {
            return sample.heartRate;
        }
        return null;
    }

    private function metricText(metric as Number, label as Number) as String {
        if (metric == Metric.LABEL) {
            return label >= 0 && label < _labels.size() ? _labels[label] : "";
        }
        if (metric == Metric.TIME) {
            return timeText();
        }
        if (metric == Metric.DATE) {
            var info = Gregorian.info(Time.now(), Time.FORMAT_SHORT);
            var weekday = (info.day_of_week as Number) - 1;
            return WEEKDAYS[weekday] + " " + info.day.toString();
        }
        if (metric == Metric.BATTERY) {
            return Math.round(System.getSystemStats().battery).toNumber().toString() + "%";
        }

        var activity = ActivityMonitor.getInfo();
        if (metric == Metric.STEPS) {
            return activity.steps == null ? NO_DATA : groupDigits(activity.steps as Number);
        }
        if (metric == Metric.HEART_RATE) {
            var hr = heartRate();
            return hr == null ? NO_DATA + " BPM" : hr.toString() + " BPM";
        }
        if (metric == Metric.CALORIES) {
            return activity.calories == null ? NO_DATA : groupDigits(activity.calories as Number) + " KCAL";
        }
        if (metric == Metric.DISTANCE) {
            var cm = activity.distance;
            return cm == null ? NO_DATA : (cm / 100000.0).format("%.2f") + " KM";
        }
        if (metric == Metric.NOTIFICATIONS) {
            return System.getDeviceSettings().notificationCount.toString() + " MSG";
        }
        if (metric == Metric.WEATHER) {
            var conditions = Weather.getCurrentConditions();
            if (conditions != null && conditions.temperature != null) {
                return Math.round(conditions.temperature as Numeric).toNumber().toString() + "°C";
            }
            return NO_DATA;
        }
        if (metric == Metric.FLOORS) {
            return activity.floorsClimbed == null ? NO_DATA : (activity.floorsClimbed as Number).toString() + " FLR";
        }
        if (metric == Metric.ACTIVE_MINUTES) {
            var active = activity.activeMinutesDay;
            return active == null ? NO_DATA : active.total.toString() + " MIN";
        }
        if (metric == Metric.STRESS) {
            return latestSample(:stress);
        }
        if (metric == Metric.BODY_BATTERY) {
            return latestSample(:bodyBattery);
        }
        if (metric == Metric.VO2MAX) {
            var profile = UserProfile.getProfile();
            return profile.vo2maxRunning == null ? NO_DATA : (profile.vo2maxRunning as Number).toString();
        }

        var info = Activity.getActivityInfo();
        if (metric == Metric.ALTITUDE) {
            return info == null || info.altitude == null ? NO_DATA : Math.round(info.altitude as Float).toNumber().toString() + " M";
        }
        if (metric == Metric.TIMER) {
            return info == null || info.timerTime == null ? NO_DATA : formatClock((info.timerTime as Number) / 1000);
        }
        if (metric == Metric.PACE) {
            if (info == null || info.currentSpeed == null || (info.currentSpeed as Float) <= 0.1) {
                return NO_DATA + " /KM";
            }
            return formatPace(1000.0 / (info.currentSpeed as Float)) + " /KM";
        }
        if (metric == Metric.SPEED) {
            return info == null || info.currentSpeed == null ? NO_DATA : ((info.currentSpeed as Float) * 3.6).format("%.1f") + " KM/H";
        }
        if (metric == Metric.CADENCE) {
            return info == null || info.currentCadence == null ? NO_DATA : (info.currentCadence as Number).toString() + " SPM";
        }
        if (metric == Metric.LAP) {
            return "LAP " + NO_DATA;
        }
        return "";
    }

    private function latestSample(kind as Symbol) as String {
        if (!(Toybox has :SensorHistory)) {
            return NO_DATA;
        }
        var options = { :period => 1, :order => SensorHistory.ORDER_NEWEST_FIRST };
        var iterator = null;
        if (kind == :stress && (SensorHistory has :getStressHistory)) {
            iterator = SensorHistory.getStressHistory(options);
        } else if (kind == :bodyBattery && (SensorHistory has :getBodyBatteryHistory)) {
            iterator = SensorHistory.getBodyBatteryHistory(options);
        }
        if (iterator == null) {
            return NO_DATA;
        }
        var sample = iterator.next();
        if (sample == null || sample.data == null) {
            return NO_DATA;
        }
        return Math.round(sample.data as Numeric).toNumber().toString();
    }

    private function timeText() as String {
        var clock = System.getClockTime();
        var hour = clock.hour;
        if (!System.getDeviceSettings().is24Hour) {
            hour = hour % 12;
            if (hour == 0) {
                hour = 12;
            }
        }
        return hour.toString() + ":" + clock.min.format("%02d");
    }

    private function groupDigits(value as Number) as String {
        var raw = value.toString();
        var out = "";
        var count = 0;
        for (var i = raw.length() - 1; i >= 0; i -= 1) {
            out = raw.substring(i, i + 1) + out;
            count += 1;
            if (count % 3 == 0 && i > 0) {
                out = "," + out;
            }
        }
        return out;
    }

    private function formatClock(totalSeconds as Number) as String {
        var hours = totalSeconds / 3600;
        var minutes = (totalSeconds % 3600) / 60;
        var seconds = totalSeconds % 60;
        if (hours > 0) {
            return hours.toString() + ":" + minutes.format("%02d") + ":" + seconds.format("%02d");
        }
        return minutes.toString() + ":" + seconds.format("%02d");
    }

    private function formatPace(secondsPerKm as Float) as String {
        var total = Math.round(secondsPerKm).toNumber();
        return (total / 60).toString() + ":" + (total % 60).format("%02d");
    }
}
