const SUNDAI_WEB_2020 = SUNDAI_WEB_2020 || {};

(function (_) {
    const _init = () => {
      // 実行する関数
      _hello();
    };

    const _hello = () => {
      console.log('Hello, SUNDAI_WEB');
    }



    _.init = _init();
})(SUNDAI_WEB_2020);

SUNDAI_WEB_2020.init;
