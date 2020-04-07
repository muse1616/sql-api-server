function toSqlType(number) {
    switch (number) {
        case 3:
            return "int";
            break;
        case 246:
            return "decimal";
            break;
        case 253:
            return "varchar";
            break;
        case 10:
            return "date";
            break;
        case 8:
            return "bigint";
            break;
        case 4:
            return "float";
            break;
        case 5:
            return "double";
            break;
        case 1:
            return "tinyint";
            break;
        case 254:
            return "char";
            break;
        case 12:
            return "datetime";
            break;
        default:
            return "unknown";
    }
}

module.exports = toSqlType;
