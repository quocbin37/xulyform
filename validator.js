const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};
    const validate = (inputElement, rule) => {
        var errorElement = getParent(
            inputElement,
            options.formGroupSelector
        ).querySelector(".form-message");
        //  var errorElement = inputElement.parentElement.querySelector('.form-message')
        var errorMessage;
        var rules = selectorRules[rule.selector];
        // lap qua tung rule (check)
        // neu co loi thi dung viec ktra
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add(
                "invalid"
            );
        } else {
            errorElement.innerText = "";

            getParent(inputElement, options.formGroupSelector).classList.remove(
                "invalid"
            );
        }

        return !errorMessage;
    };

    if (formElement) {
        //khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });
            if (isFormValid) {
                //submit với js
                if (typeof options.onSubmit === "function") {
                    var enableInputs = formElement.querySelectorAll(
                        "[name]:not([disabled])"
                    );
                    var formValues = Array.from(enableInputs).reduce(function (
                        values,
                        input
                    ) {
                        values[input.name] = input.value;
                        return values;
                    },
                        {});
                    options.onSubmit(formValues);
                } else {
                    //submit với hnahf vi mặc định
                    formElement.submit();
                }
            }
        };

        //lap qua moi rule va xu ly skien ( blur input)
        options.rules.forEach(function (rule) {
            //luu lai cai rule cho moi input
            // selectorRules[rule.selector] = rule.test;
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            //xu li khi blur
            if (inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };
                inputElement.oninput = function () {
                    var errorElement = getParent(
                        inputElement,
                        options.formGroupSelector
                    ).querySelector(".form-message");
                    errorElement.innerText = "";
                    getParent(inputElement, options.formGroupSelector).classList.remove(
                        "invalid"
                    );
                };
            }
        });
    }
}

//dinh nghia cac rules
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || "Vui Long Nhap O Day";
        },
    };
};

Validator.ismatkhau = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex =
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>~`\[\]\/\\';_\-+=])[0-9a-zA-Z!@#$%^&*(),.?":{}|<>~`\[\]\/\\';_\-+=]{8,}$/;
            return regex.test(value)
                ? undefined
                : "Mật khẩu phải trên 8 ký tự, bao gồm 1 chữ thường, 1 in hoa, 1 chữ số và 1 ký tự đặc biệt";
        },
    };
};

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            const regex =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(value) ? undefined : message || "Mail Chua Hop Le ";
        },
    };
};
Validator.isConfirmed = function (selector, getConfirmedValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmedValue()
                ? undefined
                : message || "Nhap Vao Chua Chinh Xac";
        },
    };
};
