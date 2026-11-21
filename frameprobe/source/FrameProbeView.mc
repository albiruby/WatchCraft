import Toybox.Graphics;
import Toybox.WatchUi;

// Watch face probe: fills the whole screen with flat magenta.
// Coordinates come from dc.getWidth()/getHeight() so it is safe on every resolution.
class FrameProbeView extends WatchUi.WatchFace {
    public function initialize() {
        WatchFace.initialize();
    }

    public function onUpdate(dc as Graphics.Dc) as Void {
        var width = dc.getWidth();
        var height = dc.getHeight();

        dc.setColor(0xFF00FF, 0xFF00FF);
        dc.clear();

        // Small white center marker for a visual sanity check.
        dc.setColor(0xFFFFFF, 0xFFFFFF);
        dc.fillCircle(width / 2, height / 2, 2);
    }
}
