
(function(){
  'use strict';
  angular.module('theme.templates', []).run(['$templateCache', function ($templateCache) {

    $templateCache.put('templates/bs-modal.html',
      "<div class=\"modal-header\">\n" +
      "    <h3 class=\"modal-title\">I'm a modal!</h3>\n" +
      "</div>\n" +
      "<div class=\"modal-body\">\n" +
      "    <ul>\n" +
      "        <li ng-repeat=\"item in items\">\n" +
      "            <a ng-click=\"selected.item = item\">{{ item }}</a>\n" +
      "        </li>\n" +
      "    </ul>\n" +
      "    Selected: <b>{{ selected.item }}</b>\n" +
      "</div>\n" +
      "<div class=\"modal-footer\">\n" +
      "    <button class=\"btn btn-primary\" ng-click=\"ok()\">OK</button>\n" +
      "    <button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n" +
      "</div>\n"
    );


    $templateCache.put('templates/contextual-progressbar.html',
      "<div class=\"contextual-progress\">\n" +
      "\t<div class=\"clearfix\">\n" +
      "\t\t<div class=\"progress-title\">{{heading}}</div>\n" +
      "\t\t<div class=\"progress-percentage\">{{percent | number:0}}%</div>\n" +
      "\t</div>\n" +
      "\t<div class=\"progress\">\n" +
      "\t\t<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: percent + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" ng-transclude></div>\n" +
      "\t</div>\n" +
      "</div>\n"
    );


    $templateCache.put('templates/nav_renderer.html',
      "<a ng-click=\"select(item)\" ng-href=\"{{item.url}}\">\n" +
      "  <i ng-if=\"item.iconClasses\" class=\"{{item.iconClasses}}\"></i><span>{{item.label}}</span>\n" +
      "  <span ng-bind-html=\"item.html\"></span>\n" +
      "</a>\n" +
      "<ul ng-if=\"item.children.length\" data-slide-out-nav=\"item.open\">\n" +
      "  <li ng-repeat=\"item in item.children\"\n" +
      "      ng-class=\"{ hasChild: (item.children!==undefined),\n" +
      "                      active: item.selected,\n" +
      "                        open: (item.children!==undefined) && item.open }\"\n" +
      "      ng-include=\"'templates/nav_renderer.html'\">\n" +
      "  </li>\n" +
      "</ul>\n"
    );


    $templateCache.put('templates/panel-tabs-without-heading.html',
      "<div class=\"panel {{panelClass}}\">\n" +
      "  <div class=\"panel-heading\">\n" +
      "        <h4>\n" +
      "            <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
      "        </h4>\n" +
      "  </div>\n" +
      "  <div class=\"panel-body\">\n" +
      "    <div class=\"tab-content\">\n" +
      "        <div class=\"tab-pane\"\n" +
      "            ng-repeat=\"tab in tabs\"\n" +
      "            ng-class=\"{active: tab.active}\"\n" +
      "            tab-content-transclude=\"tab\">\n" +
      "        </div>\n" +
      "    </div>\n" +
      "  </div>\n" +
      "</div>\n"
    );


    $templateCache.put('templates/panel-tabs.html',
      "<div class=\"panel {{panelClass}}\">\n" +
      "  <div class=\"panel-heading\">\n" +
      "        <h4><i ng-if=\"panelIcon\" class=\"{{panelIcon}}\"></i>{{(panelIcon? \" \":\"\")+heading}}</h4>\n" +
      "        <div class=\"options\">\n" +
      "            <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
      "        </div>\n" +
      "  </div>\n" +
      "  <div class=\"panel-body\">\n" +
      "    <div class=\"tab-content\">\n" +
      "        <div class=\"tab-pane\"\n" +
      "            ng-repeat=\"tab in tabs\"\n" +
      "            ng-class=\"{active: tab.active}\"\n" +
      "            tab-content-transclude=\"tab\">\n" +
      "        </div>\n" +
      "    </div>\n" +
      "  </div>\n" +
      "</div>\n"
    );


    $templateCache.put('templates/panel.html',
      "<div class=\"panel {{panelClass}}\">\n" +
      "  <div class=\"panel-heading\">\n" +
      "        <h4><i ng-if=\"panelIcon\" class=\"{{panelIcon}}\"></i>{{(panelIcon? \" \":\"\")+heading}}</h4>\n" +
      "        <div class=\"options\">\n" +
      "        </div>\n" +
      "  </div>\n" +
      "  <div class=\"panel-body\" ng-transclude>\n" +
      "  </div>\n" +
      "</div>\n"
    );


    $templateCache.put('templates/remote-sidebar.html',
      "\n" +
      "\n" +
      "<div id=\"rightbar-remote\" style=\"overflow: scroll;top:40px;height:100%;width:350px;box-shadow:rgb(215, 215, 215) 1px 1px 5px 1px;\">\n" +
      "    <span ng-click=\"hideRemoteSideBar()\"\n" +
      "          style=\"position: absolute;top:280px;left:0px;height:40px;width:5px;font-weight: bolder;\"\n" +
      "          class=\"btn btn-default btn-sm\">\n" +
      "      >\n" +
      "      <!--<i class=\"fa fa-mail-forward\"></i>-->\n" +
      "    </span>\n" +
      "\n" +
      "\n" +
      "  <div ng-repeat=\"item in cmdList\">\n" +
      "    <!--<div ng-click=\"item.__show = !item.__show\" class=\"control-tab-title\">-->\n" +
      "    <div ng-click=\"ctrlPanelToggle(item)\" class=\"control-tab-title\">\n" +
      "      <span style=\"background-color: rgb(145, 182, 219);border-radius: 4px;padding:2px 5px;color:#fff;font-weight:bold\">\n" +
      "        <i class=\"fa fa-wrench\"></i>&nbsp;{{item | uppercase | translate}}\n" +
      "        <span class=\"pull-right\"\n" +
      "              style=\"color:grey !important\"\n" +
      "              ng-class=\"{'fa fa-angle-down':cmdListOpt[item].show, 'fa fa-angle-right': !cmdListOpt[item].show}\">\n" +
      "              <!--ng-class=\"{'fa fa-angle-down':item.__show, 'fa fa-angle-right': !item.__show}\">-->\n" +
      "        </span>\n" +
      "      </span>\n" +
      "    </div>\n" +
      "\n" +
      "    <div collapse=\"!cmdListOpt[item].show\" class=\"table-responsive\" style=\"overflow: scroll\">\n" +
      "\n" +
      "      <table class=\"table table-bordered table-condensed table-striped\">\n" +
      "        <tbody>\n" +
      "        <tr ng-repeat=\"(key, val) in cmdListOpt[item].data.showcase\">\n" +
      "          <td align=\"left\" style=\"width:30%\">{{key}}</td>\n" +
      "          <td>\n" +
      "            <!--onbeforesave=\"updateCtrlData(item.title,key ,$data)\"-->\n" +
      "\n" +
      "            <a ng-show=\"val.display == 'select'\" class=\"light_blue border-bottom-none\"\n" +
      "               onaftersave=\"changeShowcase(item, key, $data)\"\n" +
      "               onshow=\"loadOption(item, key, val.show_key)\"\n" +
      "               e-ng-options=\"s for s in curOption\"\n" +
      "               editable-select=\"val.val\">\n" +
      "              {{val.val}}\n" +
      "            </a>\n" +
      "\n" +
      "            <a ng-show=\"val.display == 'text'\" class=\"light_blue border-bottom-none\"\n" +
      "               onaftersave=\"verifyData(item, key, $data)\"\n" +
      "               editable-text=\"val.val\">\n" +
      "              {{ val.val || 'empty' }}\n" +
      "            </a>\n" +
      "\n" +
      "          </td>\n" +
      "        </tr>\n" +
      "        </tbody>\n" +
      "      </table>\n" +
      "    </div><!--collapse table-->\n" +
      "  </div><!--ng-repeat=\"item in cmdList\"-->\n" +
      "</div><!--rightbardetail done-->\n" +
      "\n" +
      "\n"
    );


    $templateCache.put('templates/settings-sidebar.html',
      "<div id=\"rightbar-settings\"\n" +
      "     style=\"overflow: scroll;top:2px;height:100%;width:500px;box-shadow:rgb(215, 215, 215) 1px 1px 2px 1px;position: absolute\">\n" +
      "  <span ng-click=\"hideSettingsSideBar()\"\n" +
      "        style=\"position: absolute;top:280px;left:0px;height:40px;width:5px;font-weight: bolder;\"\n" +
      "        class=\"btn btn-default btn-sm\">\n" +
      "    >\n" +
      "    <!--<i class=\"fa fa-mail-forward\"></i>-->\n" +
      "  </span>\n" +
      "\n" +
      "  <tabset panel-tabs=\"true\" panel-class=\"panel-success\">\n" +
      "    <tabset-heading>\n" +
      "      <!---设备信息--->\n" +
      "    </tabset-heading>\n" +
      "\n" +
      "    <tab ng-controller=\"SettingTabController\">\n" +
      "      <tab-heading>\n" +
      "        <i class=\"fa fa-align-left\"></i>&nbsp;基本信息\n" +
      "      </tab-heading>\n" +
      "      <!--debug curEdit: {{curEdit}}-->\n" +
      "      <h5 class=\"text-info\"><i class=\"fa fa-map-marker\" style=\"font-size:smaller\"></i>&nbsp;参考位置</h5>\n" +
      "\n" +
      "      <leaflet center=\"center\"\n" +
      "               markers=\"markers\"\n" +
      "               layers=\"layers\"\n" +
      "               height=\"280px\"\n" +
      "               width=\"98%\">\n" +
      "      </leaflet>\n" +
      "\n" +
      "      <h6 style=\"color:grey\">({{locateState}})</h6>\n" +
      "      <!--<h6 style=\"color:grey\">(自动坐标仅供参考，可手动拖动)</h6>-->\n" +
      "\n" +
      "      <h5 class=\"text-info\"><i class=\"fa fa-edit\" style=\"font-size:smaller\"></i>&nbsp;基本信息</h5>\n" +
      "      <!--<button class=\"btn btn-default btn-sm\" ng-click=\"getCoor()\">getCoor</button>-->\n" +
      "\n" +
      "      <span>添加分组</span>\n" +
      "      <br>\n" +
      "      <ui-select multiple ng-model=\"multipleSelect.groups\" theme=\"bootstrap\" ng-disabled=\"disabled\" close-on-select=\"false\" style=\"width: 300px;\" title=\"Choose a color\">\n" +
      "        <ui-select-match placeholder=\"Select Group ...\">{{$item}}</ui-select-match>\n" +
      "        <ui-select-choices repeat=\"group in availableGroups | filter:$select.search\">\n" +
      "          {{group}}\n" +
      "        </ui-select-choices>\n" +
      "      </ui-select>\n" +
      "      <hr>\n" +
      "      <form class=\"form-horizontal\">\n" +
      "        <div class=\"form-group\">\n" +
      "          <label for=\"focusedinput\" class=\"col-sm-2 control-label\">设备名称</label>\n" +
      "\n" +
      "          <div class=\"col-sm-6\">\n" +
      "            <input type=\"text\" class=\"form-control input-sm\" id=\"focusedinput\" ng-model=\"curEdit.dev_alias\">\n" +
      "          </div>\n" +
      "          <div class=\"col-sm-3\">\n" +
      "            <p class=\"help-block\">Error msg</p>\n" +
      "          </div>\n" +
      "        </div>\n" +
      "        <div class=\"form-group\">\n" +
      "          <label class=\"col-sm-2 control-label\">经度</label>\n" +
      "\n" +
      "          <div class=\"col-sm-6\">\n" +
      "            <input disabled type=\"text\" class=\"form-control input-sm\" ng-model=\"curEdit.lat\">\n" +
      "          </div>\n" +
      "        </div>\n" +
      "\n" +
      "        <div class=\"form-group\">\n" +
      "          <label class=\"col-sm-2 control-label\">纬度</label>\n" +
      "\n" +
      "          <div class=\"col-sm-6\">\n" +
      "            <input disabled type=\"text\" class=\"form-control input-sm\" ng-model=\"curEdit.lng\">\n" +
      "          </div>\n" +
      "        </div>\n" +
      "\n" +
      "        <div class=\"form-group\">\n" +
      "          <label class=\"col-sm-2 control-label\">设备ID</label>\n" +
      "          <div class=\"col-sm-6\">\n" +
      "            <input disabled type=\"text\" class=\"form-control input-sm\" ng-model=\"curEdit.dev_uuid\">\n" +
      "          </div>\n" +
      "        </div>\n" +
      "\n" +
      "        <hr>\n" +
      "        <button class=\"btn btn-success\" ng-click=\"updateDevInfo()\">保存</button>\n" +
      "        <button class=\"btn btn-default\" ng-click=\"hideSettingsSideBar()\">取消</button>\n" +
      "\n" +
      "      </form>\n" +
      "    </tab>\n" +
      "\n" +
      "    <tab ng-controller=\"RemoteCtrlTabController\">\n" +
      "      <tab-heading>\n" +
      "        <i class=\"fa fa-wrench\"></i>&nbsp;远程控制\n" +
      "      </tab-heading>\n" +
      "      <!--setting-page-->\n" +
      "      <div ng-repeat=\"item in cmdList\">\n" +
      "        <!--<div ng-click=\"item.__show = !item.__show\" class=\"control-tab-title\">-->\n" +
      "        <div ng-click=\"ctrlPanelToggle(item)\" class=\"control-tab-title\">\n" +
      "      <span style=\"background-color: rgb(145, 182, 219);border-radius: 4px;padding:2px 5px;color:#fff;font-weight:bold\">\n" +
      "        <i class=\"fa fa-wrench\"></i>&nbsp;{{item | uppercase | translate}}\n" +
      "        <span class=\"pull-right\"\n" +
      "              style=\"color:grey !important\"\n" +
      "              ng-class=\"{'fa fa-angle-down':cmdListOpt[item].show, 'fa fa-angle-right': !cmdListOpt[item].show}\">\n" +
      "              <!--ng-class=\"{'fa fa-angle-down':item.__show, 'fa fa-angle-right': !item.__show}\">-->\n" +
      "        </span>\n" +
      "      </span>\n" +
      "        </div>\n" +
      "\n" +
      "        <div collapse=\"!cmdListOpt[item].show\" class=\"table-responsive\" style=\"overflow: scroll\">\n" +
      "\n" +
      "          <table class=\"table table-bordered table-condensed table-striped\">\n" +
      "            <tbody>\n" +
      "            <tr ng-repeat=\"(key, val) in cmdListOpt[item].data.showcase\">\n" +
      "              <td align=\"left\" style=\"width:30%\">{{key}}</td>\n" +
      "              <td>\n" +
      "                <!--onbeforesave=\"updateCtrlData(item.title,key ,$data)\"-->\n" +
      "\n" +
      "                <a ng-show=\"val.display == 'select'\" class=\"light_blue border-bottom-none\"\n" +
      "                   onaftersave=\"changeShowcase(item, key, $data)\"\n" +
      "                   onshow=\"loadOption(item, key, val.show_key)\"\n" +
      "                   e-ng-options=\"s for s in curOption\"\n" +
      "                   editable-select=\"val.val\">\n" +
      "                  {{val.val}}\n" +
      "                </a>\n" +
      "\n" +
      "                <a ng-show=\"val.display == 'text'\" class=\"light_blue border-bottom-none\"\n" +
      "                   onaftersave=\"verifyData(item, key, $data)\"\n" +
      "                   editable-text=\"val.val\">\n" +
      "                  {{ val.val || 'empty' }}\n" +
      "                </a>\n" +
      "\n" +
      "              </td>\n" +
      "            </tr>\n" +
      "            </tbody>\n" +
      "          </table>\n" +
      "        </div>\n" +
      "        <!--collapse table-->\n" +
      "      </div>\n" +
      "      <!--ng-repeat=\"item in cmdList\"-->\n" +
      "    </tab>\n" +
      "  </tabset>\n" +
      "\n" +
      "  <hr>\n" +
      "</div><!--rightbardetail done-->\n" +
      "\n" +
      "\n" +
      "<script>\n" +
      "\n" +
      "  $('#rightbar-settings').bind('mousewheel DOMMouseScroll', function(e) {\n" +
      "    var scrollTo = null;\n" +
      "\n" +
      "    console.info(\"mousewheel DOMMouseScroll: \", e)\n" +
      "\n" +
      "    if (e.type == 'mousewheel') {\n" +
      "      scrollTo = (e.originalEvent.wheelDelta * -1);\n" +
      "    }\n" +
      "    else if (e.type == 'DOMMouseScroll') {\n" +
      "      scrollTo = 40 * e.originalEvent.detail;\n" +
      "    }\n" +
      "\n" +
      "    if (scrollTo) {\n" +
      "      e.preventDefault();\n" +
      "      $(this).scrollTop(scrollTo + $(this).scrollTop());\n" +
      "    }\n" +
      "  });\n" +
      "\n" +
      "\n" +
      "</script>\n" +
      "\n"
    );


    $templateCache.put('templates/themed-tabs-bottom.html',
      "<div class=\"tab-container tab-{{theme || 'primary'}} tab-{{position || 'normal'}}\">\n" +
      "  <div class=\"tab-content\">\n" +
      "    <div class=\"tab-pane\"\n" +
      "        ng-repeat=\"tab in tabs\"\n" +
      "        ng-class=\"{active: tab.active}\"\n" +
      "        tab-content-transclude=\"tab\">\n" +
      "    </div>\n" +
      "  </div>\n" +
      "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
      "</div>\n"
    );


    $templateCache.put('templates/themed-tabs.html',
      "<div class=\"tab-container tab-{{theme || 'primary'}} tab-{{position || 'normal'}}\">\n" +
      "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
      "  <div class=\"tab-content\">\n" +
      "    <div class=\"tab-pane\"\n" +
      "        ng-repeat=\"tab in tabs\"\n" +
      "        ng-class=\"{active: tab.active}\"\n" +
      "        tab-content-transclude=\"tab\">\n" +
      "    </div>\n" +
      "  </div>\n" +
      "</div>\n"
    );


    $templateCache.put('templates/tile-channel.html',
      "<style>\n" +
      "  .tile-channel-title {\n" +
      "    font-size: medium;\n" +
      "    font-weight: bold;\n" +
      "    background:rgb(48, 48, 48);\n" +
      "    border-bottom-right-radius: 10px;\n" +
      "  }\n" +
      "\n" +
      "  .tile-channel-body {\n" +
      "    border-top: 1px solid grey;\n" +
      "    border-right: 1px solid grey;\n" +
      "    /*border-left: 1px solid grey;*/\n" +
      "    margin-bottom: 5px;\n" +
      "    font-size: x-large;\n" +
      "  }\n" +
      "\n" +
      "  .border-left-grey {\n" +
      "    border-left: 1px solid grey;\n" +
      "  }\n" +
      "\n" +
      "  .border-right-grey {\n" +
      "    border-right: 1px solid grey;\n" +
      "  }\n" +
      "\n" +
      "  .am-color {\n" +
      "    color:rgb(215, 203, 84)\n" +
      "  }\n" +
      "\n" +
      "  .fm-color {\n" +
      "    color: rgb(112, 216, 208);\n" +
      "  }\n" +
      "\n" +
      "  .tile-channel-top {\n" +
      "    font-size: xx-small;\n" +
      "    font-weight:normal;\n" +
      "    line-height: 10px;\n" +
      "    padding-bottom: 5px;\n" +
      "  }\n" +
      "\n" +
      "  .font-normal {\n" +
      "    font-weight:normal !important;\n" +
      "  }\n" +
      "\n" +
      "  .badge {\n" +
      "    padding: 2px 2px;\n" +
      "  }\n" +
      "\n" +
      "  .online {\n" +
      "    color: rgb(112, 210, 112) !important;\n" +
      "  }\n" +
      "\n" +
      "  .freq-select {\n" +
      "    background-color: rgb(86, 154, 184);\n" +
      "    color: #fff;\n" +
      "  }\n" +
      "\n" +
      "  .radius {\n" +
      "    border-radius: 15px;\n" +
      "  }\n" +
      "\n" +
      "  .shortcut-tiles .tiles-body i {\n" +
      "    font-size: 10px;\n" +
      "  }\n" +
      "\n" +
      "  .light-blue {\n" +
      "    color: rgb(109, 163, 216) !important;\n" +
      "  }\n" +
      "\n" +
      "  .small-font {\n" +
      "    font-size: small\n" +
      "  }\n" +
      "\n" +
      "  .grey-font {\n" +
      "    color: rgb(169, 164, 164)\n" +
      "  }\n" +
      "\n" +
      "  .hand {\n" +
      "    cursor: pointer;\n" +
      "  }\n" +
      "\n" +
      "</style>\n" +
      "\n" +
      "<div class=\"shortcut-tiles tiles-inverse\">\n" +
      "  <div class=\"tiles-body\" style=\"border-radius: 12px\">\n" +
      "    <div class=\"row\">\n" +
      "      <div class=\"col-md-2 tile-channel-top text-center hidden-sm hidden-xs\">\n" +
      "        <span ng-show=\"devinfo.common.online\">\n" +
      "          <i class=\"fa fa-circle online\"></i>&nbsp;<span class=\"grey-font\">在线</span>\n" +
      "        </span>\n" +
      "        <span ng-show=\"!devinfo.common.online\">\n" +
      "          <i class=\"fa fa-circle\"></i>&nbsp;<span class=\"grey-font\">离线</span>\n" +
      "        </span>\n" +
      "\n" +
      "        &nbsp;<i class=\"fa fa-database\"></i>&nbsp;<span class=\"grey-font\">{{devinfo.common.ssd_usage}}</span>\n" +
      "      </div>\n" +
      "      <div ng-repeat=\"chn in devinfo.components\" class=\"col-md-1 tile-channel-top text-center hidden-sm hidden-xs\">\n" +
      "        <!--<span class=\"badge badge-orange font-normal\">{{chn.enctype}}</span>-->\n" +
      "        <span class=\"badge font-normal\"\n" +
      "              ng-class=\"{'badge-orange':chn.enctype == 'aac', 'badge-info':chn.enctype == 'mp3' }\">\n" +
      "          {{chn.enctype}}\n" +
      "        </span>\n" +
      "\n" +
      "        <span class=\"badge badge-danger font-normal\">{{(chn.bitrate / 1000)+'k'}}</span>\n" +
      "      </div>\n" +
      "    </div>\n" +
      "\n" +
      "    <div class=\"row\">\n" +
      "      <div class=\"col-md-2 tile-channel-title text-center\">\n" +
      "        <span class=\"\">{{devinfo.common.dev_name}}</span>\n" +
      "      </div>\n" +
      "      <div ng-repeat=\"chn in devinfo.components\" class=\"col-md-1 col-sm-1 tile-channel-body text-center\">\n" +
      "        <span class=\"hand\"\n" +
      "              ng-class=\"{'fm-color':chn.mode == 'fm','am-color':chn.mode == 'am', 'freq-select': curselect == (devinfo.common.dev_uuid + chn.components_id)}\"\n" +
      "              ng-click=\"select(devinfo.common.dev_uuid, chn.components_id)\">\n" +
      "          {{chn.freq}}\n" +
      "        </span>\n" +
      "        <span class=\"visible-xs visible-sm\">&nbsp; <i class=\"fa fa-ellipsis-v\"></i>&nbsp;<span class=\"label label-orange\">{{chn.mode}}</span></span>\n" +
      "        <span class=\"visible-xs visible-sm\">&nbsp; <i class=\"fa fa-ellipsis-v\"></i>&nbsp;通道&nbsp;{{chn.components_id}}</span>\n" +
      "      </div>\n" +
      "\n" +
      "    </div>\n" +
      "\n" +
      "    <div class=\"row\">\n" +
      "      <div class=\"col-md-2 tile-channel-top text-center\">\n" +
      "        <i class=\"fa fa-cloud-upload\"></i>&nbsp;<span class=\"grey-font\">{{devinfo.common.uploading_speed}}</span>\n" +
      "        &nbsp;&nbsp;<i class=\"fa fa-info-circle\"></i>&nbsp;<span class=\"grey-font\">{{devinfo.common.version}}</span>\n" +
      "      </div>\n" +
      "\n" +
      "      <div ng-repeat=\"chn in devinfo.components\" class=\"col-md-1 tile-channel-top text-center hidden-sm hidden-xs\">\n" +
      "        <i class=\"fa fa-ellipsis-v\"></i>&nbsp;通道&nbsp;{{chn.components_id}}\n" +
      "      </div>\n" +
      "\n" +
      "    </div>\n" +
      "  </div><!--tiles-body-->\n" +
      "</div><!--shortcut-tiles-->\n" +
      "\n" +
      "\n" +
      "\n" +
      "\n"
    );


    $templateCache.put('templates/tile-generic.html',
      "<div class=\"info-tiles tiles-{{type}}\">\n" +
      "\t<div class=\"tiles-heading\">\n" +
      "\t\t{{heading}}\n" +
      "\t</div>\n" +
      "\t<div class=\"tiles-body\" ng-transclude>\n" +
      "\t</div>\n" +
      "</div>\n"
    );


    $templateCache.put('templates/tile-headerbar.html',
      "\n" +
      "<style>\n" +
      "  .headerbar-tile-info {\n" +
      "    border-left:2px solid rgb(63, 117, 131);\n" +
      "    padding-left: 6px;\n" +
      "    background-color: rgba(74, 74, 74, 0.45);\n" +
      "    border-radius:4px;\n" +
      "    height: 80px;\n" +
      "  }\n" +
      "\n" +
      "  .headerbar-tile-header {\n" +
      "    color:rgb(158, 158, 158);\n" +
      "    border-bottom: 1px dashed rgb(69, 69, 69);\n" +
      "  }\n" +
      "\n" +
      "  .headerbar-tile-body {\n" +
      "    height:60px;\n" +
      "    overflow: scroll;\n" +
      "    /*overflow: hidden;*/\n" +
      "  }\n" +
      "\n" +
      "  .line-height-14 {\n" +
      "    line-height: 14px;\n" +
      "  }\n" +
      "\n" +
      "  .small-fa {\n" +
      "    font-size:0.8em;\n" +
      "  }\n" +
      "  .xx-small {\n" +
      "    font-size: xx-small;\n" +
      "  }\n" +
      "  .x-small{\n" +
      "    font-size: small;\n" +
      "  }\n" +
      "\n" +
      "</style>\n" +
      "\n" +
      "<div class=\"headerbar-tile-info\">\n" +
      "  <!--<div class=\"headerbar-tile-header\"><i class=\"fa fa-random small-fa\"></i>&nbsp;{{data.header.text}}</div>-->\n" +
      "  <div class=\"headerbar-tile-header\"><i class=\"{{data.header.cssClass}} small-fa\"></i>&nbsp;{{data.header.text}}</div>\n" +
      "  <div class=\"headerbar-tile-body\">\n" +
      "    <div class=\"line-height-14 x-small\" ng-repeat=\"item in data.content\">\n" +
      "      <span>{{item.key | translate}}:</span> <span>{{item.val}}</span>\n" +
      "    </div>\n" +
      "\n" +
      "  </div>\n" +
      "</div>\n" +
      "\n"
    );


    $templateCache.put('templates/tile-large.html',
      "<a class=\"info-tiles tiles-{{item.color}}\" ng-href=\"{{item.href}}\">\n" +
      "    <div class=\"tiles-heading\">\n" +
      "        <div class=\"pull-left\">{{item.title}}</div>\n" +
      "        <div class=\"pull-right\">{{item.titleBarInfo}}</div>\n" +
      "    </div>\n" +
      "    <div class=\"tiles-body\">\n" +
      "        <div class=\"pull-left\"><i class=\"{{item.classes}}\"></i></div>\n" +
      "        <div class=\"pull-right\" ng-show=\"item.text\">{{item.text}}</div>\n" +
      "        <div class=\"pull-right\" ng-show=\"!item.text\" ng-transclude></div>\n" +
      "    </div>\n" +
      "</a>\n"
    );


    $templateCache.put('templates/tile-mini.html',
      "<a class=\"shortcut-tiles tiles-{{item.color}}\" ng-href=\"{{item.href}}\">\n" +
      "  <div class=\"tiles-body\">\n" +
      "    <div class=\"pull-left\"><i class=\"{{item.classes}}\"></i></div>\n" +
      "    <div class=\"pull-right\"><span class=\"badge\">{{item.titleBarInfo}}</span></div>\n" +
      "  </div>\n" +
      "  <div class=\"tiles-footer\">\n" +
      "    {{item.text}}\n" +
      "  </div>\n" +
      "</a>\n"
    );
  }])

})();



