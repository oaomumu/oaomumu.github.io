// 使用文本绘图。移植自《生成设计》一书 - http://www.generative-gestaltung.de - 原许可证: http://www.apache.org/licenses/LICENSE-2.0

// 应用程序变量
var position = {x: 0, y: window.innerHeight / 2}; // 文本的初始位置
var counter = 0; // 字母计数器
var minFontSize = 3; // 最小字体大小
var letters = "There was a table set out under a tree in front of the house..."; // 要绘制的文本

// 绘图变量
var canvas; // 画布元素
var context; // 2D 渲染上下文
var mouse = {x: 0, y: 0, down: false}; // 鼠标状态

function init() {
  canvas = document.getElementById('canvas'); // 获取画布元素
  context = canvas.getContext('2d'); // 获取 2D 上下文
  canvas.width = window.innerWidth; // 设置画布宽度
  canvas.height = window.innerHeight; // 设置画布高度
  
  // 添加鼠标和窗口大小调整的事件监听器
  canvas.addEventListener('mousemove', mouseMove, false);
  canvas.addEventListener('mousedown', mouseDown, false);
  canvas.addEventListener('mouseup', mouseUp, false);
  canvas.addEventListener('mouseout', mouseUp, false);  
  canvas.addEventListener('dblclick', doubleClick, false);
  
  window.onresize = function(event) {
    canvas.width = window.innerWidth; // 窗口调整时调整画布宽度
    canvas.height = window.innerHeight; // 窗口调整时调整画布高度
  }
}

function mouseMove(event) {
  mouse.x = event.pageX; // 更新鼠标的 X 位置
  mouse.y = event.pageY; // 更新鼠标的 Y 位置
  draw(); // 调用绘图函数
}

function draw() {
  if (mouse.down) { // 如果鼠标按下
    var d = distance(position, mouse); // 计算当前位置与上次绘制位置的距离
    var fontSize = minFontSize + d / 2; // 根据距离计算字体大小
    var letter = letters[counter]; // 获取当前字母
    var stepSize = textWidth(letter, fontSize); // 获取字母的宽度

    if (d > stepSize) { // 如果距离大于字母的宽度
      var angle = Math.atan2(mouse.y - position.y, mouse.x - position.x); // 计算角度
      
      context.font = fontSize + "px Georgia"; // 设置字体大小和字体
    
      context.save();
      context.translate(position.x, position.y); // 将上下文移动到当前位置
      context.rotate(angle); // 旋转上下文
      context.fillText(letter, 0, 0); // 绘制字母
      context.restore();

      counter++; // 移动到下一个字母
      if (counter > letters.length - 1) { // 如果计数器超过字母长度则重置
        counter = 0;
      }

      position.x = position.x + Math.cos(angle) * stepSize; // 更新位置
      position.y = position.y + Math.sin(angle) * stepSize;
    }
  }     
}

function distance(pt, pt2) {
  var xs = pt2.x - pt.x; // 计算 X 差值
  var ys = pt2.y - pt.y; // 计算 Y 差值
  return Math.sqrt(xs * xs + ys * ys); // 返回距离
}

function mouseDown(event) {
  mouse.down = true; // 设置鼠标按下状态为真
  position.x = event.pageX; // 更新位置为当前鼠标位置
  position.y = event.pageY;
  
  document.getElementById('info').style.display = 'none'; // 隐藏信息元素
}

function mouseUp(event) {
  mouse.down = false; // 设置鼠标按下状态为假
}

function doubleClick(event) {
  canvas.width = canvas.width; // 双击画布清空它
}

function textWidth(string, size) {
  context.font = size + "px Georgia"; // 设置字体大小
  return context.measureText(string).width; // 测量并返回文本宽度
}

init(); // 初始化应用程序