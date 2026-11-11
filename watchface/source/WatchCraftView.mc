import Toybox.Graphics;
import Toybox.Lang;
import Toybox.System;
import Toybox.Time;
import Toybox.Time.Gregorian;
import Toybox.WatchUi;

// Layout ini adalah cermin dari template web "Quiet".
// Angka dalam satuan kanvas 390 x 390, sama seperti design JSON.
module Layout {
    const CENTER = 195;
    const TIME_Y = 196;
    const DATE_Y = 268;
    const RADIUS = 170;
    const ARC_WIDTH = 2;
    const ARC_FROM = 120;
    const ARC_TO = 60;

    const COLOR_BACKGROUND = Graphics.COLOR_BLACK;
    const COLOR_INK = 0xF2F5F9;
    const COLOR_MUTED = 0x7C8698;
    const COLOR_TRACK = 0x1A2029;
    const COLOR_ACCENT = 0xFF7A1A;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as Array<String>;

class WatchCraftView extends WatchUi.WatchFace {
    public function initialize() {
        WatchFace.initialize();
    }

    public function onUpdate(dc as Graphics.Dc) as Void {
        dc.setColor(Layout.COLOR_BACKGROUND, Layout.COLOR_BACKGROUND);
        dc.clear();

        drawBatteryArc(dc);
        drawDate(dc);
        drawTime(dc);
    }

    private function drawBatteryArc(dc as Graphics.Dc) as Void {
        var battery = System.getSystemStats().battery;
        var ratio = battery / 100.0;
        if (ratio < 0.0) {
            ratio = 0.0;
        }
        if (ratio > 1.0) {
            ratio = 1.0;
        }

        dc.setPenWidth(Layout.ARC_WIDTH);
        dc.setColor(Layout.COLOR_TRACK, Graphics.COLOR_TRANSPARENT);
        dc.drawArc(
            Layout.CENTER,
            Layout.CENTER,
            Layout.RADIUS,
            Graphics.ARC_COUNTER_CLOCKWISE,
            Layout.ARC_TO,
            Layout.ARC_FROM
        );

        var valueStart = Layout.ARC_FROM - ((Layout.ARC_FROM - Layout.ARC_TO) * ratio);

        dc.setColor(Layout.COLOR_ACCENT, Graphics.COLOR_TRANSPARENT);
        dc.drawArc(
            Layout.CENTER,
            Layout.CENTER,
            Layout.RADIUS,
            Graphics.ARC_COUNTER_CLOCKWISE,
            valueStart,
            Layout.ARC_FROM
        );
    }

    private function drawTime(dc as Graphics.Dc) as Void {
        var clock = System.getClockTime();
        var text = Lang.format("$1$:$2$", [pad2(clock.hour), pad2(clock.min)]);
        var font = Graphics.FONT_NUMBER_HOT;
        var height = Graphics.getFontHeight(font);

        dc.setColor(Layout.COLOR_INK, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            Layout.CENTER,
            Layout.TIME_Y - (height / 2),
            font,
            text,
            Graphics.TEXT_JUSTIFY_CENTER
        );
    }

    private function drawDate(dc as Graphics.Dc) as Void {
        var text = dateText();
        var font = Graphics.FONT_TINY;
        var height = Graphics.getFontHeight(font);

        dc.setColor(Layout.COLOR_MUTED, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            Layout.CENTER,
            Layout.DATE_Y - (height / 2),
            font,
            text,
            Graphics.TEXT_JUSTIFY_CENTER
        );
    }

    private function dateText() as String {
        var info = Gregorian.info(Time.now(), Time.FORMAT_SHORT);
        return Lang.format("$1$ $2$", [weekdayName(), info.day]);
    }

    // Hari dihitung dari epoch supaya nama hari selalu Inggris dan sama dengan preview web.
    private function weekdayName() as String {
        var dayIndex = ((Time.now().value() / 86400) + 4) % 7;
        if (dayIndex < 0) {
            dayIndex += 7;
        }
        return WEEKDAYS[dayIndex];
    }

    private function pad2(value as Number) as String {
        return value < 10 ? "0" + value.toString() : value.toString();
    }
}
