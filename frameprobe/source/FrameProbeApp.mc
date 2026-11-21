import Toybox.Application;
import Toybox.WatchUi;

class FrameProbeApp extends Application.AppBase {
    public function initialize() {
        AppBase.initialize();
    }

    public function getInitialView() as [WatchUi.Views] or [WatchUi.Views, WatchUi.InputDelegates] {
        return [new FrameProbeView()];
    }
}
