KD=kramdown-rfc2629
XR=xml2rfc

ALL: iid.en.html iid.en.txt

%.xml: %.md
	$(KD) $< > $@

%.html %.txt: %.xml
	$(XR) $< --html --text

.PRECIOUS: %.xml
