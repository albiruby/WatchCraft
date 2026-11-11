import Toybox.Activity;
import Toybox.Graphics;
import Toybox.Lang;
import Toybox.WatchUi;

// Data field lari untuk Forerunner 165.
// Layout mengikuti template "Pace Panel": pace besar, jarak dan waktu di bawah.
class WatchCraftFieldView extends WatchUi.DataField {
    private var mPace as String = "--:--";
    private var mDistance as String = "0.00";
    private var mTimer as String = "0:00";
    private var mHeart as String = "--";

    public function initialize() {
        DataField.initialize();
    }

    public function compute(info as Activity.Info) as Void {
        var timer = info.timerTime;
        if (timer != null) {
            mTimer = formatDuration(timer / 1000);
        }

        var distance = info.elapsedDistance;
        if (distance != null) {
            mDistance = (distance / 1000.0).format("%.2f");
        }

        var speed = info.currentSpeed;
        if (speed != null && speed > 0.2) {
            mPace = formatPace(speed);
        }

        var heart = info.currentHeartRate;
        if (heart != null) {
            mHeart = heart.toString();
        }
    }

    public function onUpdate(dc as Graphics.Dc) as Void {
        var width = dc.getWidth();
        var height = dc.getHeight();
        var center = width / 2;

        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.clear();

        dc.setColor(0x8A93A3, Graphics.COLOR_TRANSPARENT);
        dc.drawText(center, height * 0.08, Graphics.FONT_TINY, "PACE", Graphics.TEXT_JUSTIFY_CENTER);

        var paceFont = Graphics.FONT_NUMBER_HOT;
        var paceHeight = Graphics.getFontHeight(paceFont);
        dc.setColor(0xFFFFFF, Graphics.COLOR_TRANSPARENT);
        dc.drawText(
            center,
            (height / 2) - (paceHeight / 2) - (height * 0.03),
            paceFont,
            mPace,
            Graphics.TEXT_JUSTIFY_CENTER
        );

        dc.setColor(0x232B38, Graphics.COLOR_TRANSPARENT);
        dc.drawLine(width * 0.16, height * 0.70, width * 0.84, height * 0.70);

        dc.setColor(0xFFFFFF, Graphics.COLOR_TRANSPARENT);
        dc.drawText(width * 0.28, height * 0.76, Graphics.FONT_SMALL, mDistance, Graphics.TEXT_JUSTIFY_CENTER);
        dc.drawText(width * 0.72, height * 0.76, Graphics.FONT_SMALL, mTimer, Graphics.TEXT_JUSTIFY_CENTER);

        dc.setColor(0xFF7A1A, Graphics.COLOR_TRANSPARENT);
        dc.drawText(center, height * 0.88, Graphics.FONT_TINY, mHeart + " BPM", Graphics.TEXT_JUSTIFY_CENTER);
    }

    private function formatDuration(seconds as Number) as String {
        var hours = seconds / 3600;
        var minutes = (seconds % 3600) / 60;
        var rest = seconds % 60;

        if (hours > 0) {
            return Lang.format("$1$:$2$:$3$", [hours, pad2(minutes), pad2(rest)]);
        }

        return Lang.format("$1$:$2$", [minutes, pad2(rest)]);
    }

    private function formatPace(speed as Float) as String {
        var seconds = (1000.0 / speed).toNumber();
        var minutes = seconds / 60;
        var rest = seconds % 60;
        return Lang.format("$1$:$2$", [minutes, pad2(rest)]);
    }

    private function pad2(value as Number) as String {
        return value < 10 ? "0" + value.toString() : value.toString();
    }
}
