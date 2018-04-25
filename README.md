Converts HTML and RTF files for [Overview](https://github.com/overview/overview-server).

# Methodology

This program always outputs `0.json`, `0.txt`, `0.blob` and
`0-thumbnail.jpg`.

The output JSON has `"wantOcr": false` and `"contentType": "application/pdf".
Other input JSON (in particular, `"wantSplitByPage"`) is passed through.

We convert HTML using Firefox. See
[benchmarks](https://github.com/adamhooper/html-to-pdf-benchmarks) for rationale.

We convert RTF using [Ted](https://www.nllgg.nl/Ted/) and then
[Ghostscript](https://www.ghostscript.com/). The RTF-conversion landscape on
Linux is sad: [unrtf](https://www.gnu.org/software/unrtf/) doesn't support
images, and [LibreOffice](https://www.libreoffice.org/) is slow and unreliable.
Ted is obsolete, but it speaks RTF natively, and it converts much faster than
the competition -- even with the additional Ghostscript step.

We bundle HTML and RTF conversion into the same package because both use the
same dependencies, and we want both to have a large font stack -- making both
require a heavyweight Docker image with the same files.

# Testing

Write to `test/test-XYZ`. `docker build .` will run the tests.

Each test has `input.blob` (which means the same as in production) and
`input.json` (whose contents are `$1` in `do-convert-single-file`). The files
`stdout`, `0.json`, `0.blob`, `0.txt`, and `0-thumbnail.(png|jpg)` in the
test directory are expected values. If actual values differ from expected
values, the test fails.

PDF, PNG and JPEG are tricky formats to get exactly right. You may need to use
the Docker image itself to generate expected output files. For instance, this is
how we built `test/test-1page/0-thumbnail.png`:

1. Wrote `test/test-1page/{input.json,input.blob,0.txt,0.blob,stdout}`
1. Ran `docker build .`. The end of the output looked like this:
    ```
    Step 12/13 : RUN [ "/app/test-convert-single-file" ]
     ---> Running in f65521f3a30c
    1..3
    not ok 1 - test-1page
        do-convert-single-file wrote /tmp/test-do-convert-single-file912093989/0-thumbnail.jpg, but we expected it not to exist
    ...
    ```
1. `docker cp f65521f3a30c:/tmp/test-do-convert-single-file912093989/0-thumbnail.jpg test/test-1page/`
1. `docker rm -f f65521f3a30c`
