﻿'use strict';

(function () {

    function productEditorProductEdit($scope, $routeParams, merchelloProductService, notificationsService, dialogService, merchelloWarehouseService, merchelloSettingsService) {

        ////--------------------------------------------------------------------------------------
        //// Declare and initialize key scope properties
        ////--------------------------------------------------------------------------------------
        //// 




        ////--------------------------------------------------------------------------------------
        //// Initialization methods
        ////--------------------------------------------------------------------------------------


        /**
         * @ngdoc method
         * @name init
         * @function
         * 
         * @description
         * Method called on intial page load.  Loads in data from server and sets up scope.
         */
        $scope.init = function () {

            // Handle the form submitting event to save the product information to Merchello tables
            $scope.$on("formSubmitting", function (e, args) {
                //e.preventDefault();
                //e.stopPropagation();
                if (args.scope.contentForm.$valid) {
                    notificationsService.success("Saving merchello product", "");
                    $scope.save();
                }
            });

        };

        $scope.init();


        //--------------------------------------------------------------------------------------
        // Event Handlers
        //--------------------------------------------------------------------------------------

        /**
         * @ngdoc method
         * @name save
         * @function
         * 
         * @description
         * Called when the Save button is pressed.  See comments below.
         */
        $scope.save = function () {

            if ($scope.creatingProduct) // Save on initial create
            {
                if (!$scope.product.hasVariants && $scope.product.productOptions.length > 0) // The options checkbox was checked, a blank option was added, then the has options was unchecked
                {
                    $scope.product.productOptions = [];
                }

                // Copy from master variant
                $scope.product.copyFromVariant($scope.productVariant);

                var promiseCreate = merchelloProductService.createProduct($scope.product, function () {
                    $scope.creatingProduct = false;
                    //notificationsService.success("*** Product ", status);
                });
                promiseCreate.then(function (product) {

                    $scope.product = product;
                    $scope.productVariant.copyFromProduct($scope.product);

                    $scope.creatingProduct = false; // For the variant edit/create view.

                    $scope.model.value = $scope.product.key;

                   // $location.url("/merchello/merchello/ProductEdit/" + $scope.product.key, true);

                    notificationsService.success("Product Created and Saved", "");

                }, function (reason) {
                    notificationsService.error("Product Create Failed", reason.message);
                });
            } else // if saving a product (not a variant)
            {
                if ($scope.product.hasVariants) // We added options / variants to a product that previously did not have them OR on save during a create
                {
                    // Copy from master variant
                    $scope.product.copyFromVariant($scope.productVariant);

                    var promise = merchelloProductService.updateProductWithVariants($scope.product);

                    promise.then(function (product) {
                        notificationsService.success("Products and variants saved", "");

                        $scope.product = product;
                        $scope.productVariant.copyFromProduct($scope.product);

                        if ($scope.product.hasVariants) {
                            //$location.url("/merchello/merchello/ProductEditWithOptions/" + $scope.product.key, true);
                        }

                    }, function (reason) {
                        notificationsService.error("Product or variants save Failed", reason.message);
                    });
                } else // Simple product save with no options or variants
                {
                    if ($scope.product.productOptions.length > 0) // The options checkbox was checked, a blank option was added, then the has options was unchecked
                    {
                        $scope.product.productOptions = [];
                    }

                    // Copy from master variant
                    $scope.product.copyFromVariant($scope.productVariant);

                    var promise = merchelloProductService.updateProduct($scope.product);

                    promise.then(function (product) {
                        notificationsService.success("Product Saved", "");

                        $scope.product = product;
                        $scope.productVariant.copyFromProduct($scope.product);

                    }, function (reason) {
                        notificationsService.error("Product Save Failed", reason.message);
                    });
                }
            }
        };

        /**
        * @ngdoc method
        * @name updateVariants
        * @function
        * 
        * @description
        * Called when the Update button is pressed below the options.  This will create a new product if necessary 
        * and save the product.  Then the product variants are generated.
        * 
        * We have to create the product because the API cannot create the variants with a product with options.
        */
        $scope.updateVariants = function (thisForm) {

            if (thisForm.$valid) {
                // Copy from master variant
                $scope.product.copyFromVariant($scope.productVariant);

                var promise = merchelloProductService.updateProduct($scope.product);

                promise.then(function(product) {
                    notificationsService.success("Product Saved", "");

                    $scope.product = product;
                    $scope.productVariant.copyFromProduct($scope.product);

                    $scope.product = merchelloProductService.createVariantsFromOptions($scope.product);

                }, function(reason) {
                    notificationsService.error("Product Save Failed", reason.message);
                });
            }

        };


    };

    angular.module("umbraco").controller('Merchello.PropertyEditors.MerchelloProductEditor.ProductEdit', ['$scope', '$routeParams', 'merchelloProductService', 'notificationsService', 'dialogService', 'merchelloWarehouseService', 'merchelloSettingsService', productEditorProductEdit]);

})();