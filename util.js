class Util {
    static getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    } 
    static pad(n, width) {
        z = '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    static getLarger(time1, time2) {
        var value1 = time1.split(":");
    }
    static shortHour = hour => (hour > 12 ? hour - 12 : hour === 0 ? 12 : hour);
    static longHour = (hour, ampm) => (hour==12 && ampm == 'AM' ? 0 : hour==12 ? 12 : ampm == 'AM' ? hour : ampm == 'PM' ? 12 + hour : hour);
}