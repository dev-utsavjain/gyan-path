package razorpay

func toSmallestUnit(amount int64, currency string) int64 {
	if _, ok := zeroDecimal[currency]; ok {
		return amount
	}
	return amount * 100
}

var zeroDecimal = map[string]struct{}{
	"JPY": {},
	"KRW": {},
	"VND": {},
}
